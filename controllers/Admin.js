import {db} from '../database/db.js';
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from 'jsonwebtoken';

export const getAllAdmins = (req, res) => {
    const query = `
        SELECT admin_id, first_name, last_name, email 
        FROM Admins
    `;

    db.execute(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No admins found' });
        }

        res.status(200).json(results);
    });
};

export const getAdminById = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT admin_id, first_name, last_name, email 
        FROM Admins
        WHERE admin_id = ?
    `;

    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json(results[0]);
    });
};


export const loginAdmin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Not a valid Email format"
        });
    }

    const query = `
        SELECT admin_id, first_name, last_name, email, password_hash 
        FROM Admins
        WHERE email = ?
    `;

    db.execute(query, [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const admin = results[0];
        bcrypt.compare(password, admin.password_hash, (err, isMatch) => {
            if (err) {
                console.error('Error verifying password:', err);
                return res.status(500).json({ error: 'Internal error' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate a JWT token
            const token = jwt.sign(
                { admin_id: admin.admin_id, email: admin.email },
                'your_jwt_secret',
                { expiresIn: '1h' }
            );

            res.status(200).json({ 
                message: 'Login successful',
                token 
            });
        });
    });
};

export const changeAdminPassword = (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new passwords are required' });
    }

    const query = `
        SELECT password_hash 
        FROM Admins
        WHERE admin_id = ?
    `;

    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const { password_hash } = results[0];
        bcrypt.compare(currentPassword, password_hash, (err, isMatch) => {
            if (err) {
                console.error('Error verifying password:', err);
                return res.status(500).json({ error: 'Internal error' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            bcrypt.hash(newPassword, 10, (err, newHashedPassword) => {
                if (err) {
                    console.error('Error hashing new password:', err);
                    return res.status(500).json({ error: 'Internal error' });
                }

                const updateQuery = `
                    UPDATE Admins
                    SET password_hash = ?
                    WHERE admin_id = ?
                `;

                db.execute(updateQuery, [newHashedPassword, id], (err, updateResults) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }

                    res.status(200).json({ message: 'Password changed successfully' });
                });
            });
        });
    });
};

export const createAdmin = (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash the password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ error: 'Error hashing password' });
        }

        const query = `
            INSERT INTO Admins (first_name, last_name, email, password_hash)
            VALUES (?, ?, ?, ?)
        `;

        // Execute the query
        db.execute(query, [first_name, last_name, email, hashedPassword], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({
                message: 'Admin created successfully',
                admin_id: results.insertId, // Return the new admin's ID
            });
        });
    });
};

export const updateAdminInfo = (req, res) => {
    const { id } = req.params; // Admin ID from request parameters
    const { first_name, last_name, email } = req.body; // Fields to update

    // Validate input
    if (!first_name && !last_name && !email) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Not a valid Email format"
        });
    }

    // Build dynamic query and values array
    const fields = [];
    const values = [];

    if (first_name) {
        fields.push('first_name = ?');
        values.push(first_name);
    }
    if (last_name) {
        fields.push('last_name = ?');
        values.push(last_name);
    }
    if (email) {
        fields.push('email = ?');
        values.push(email);
    }

    // Add admin ID to the values array
    values.push(id);

    const query = `
        UPDATE Admins
        SET ${fields.join(', ')}
        WHERE admin_id = ?
    `;

    // Execute the query
    db.execute(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Email already in use' });
            }
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin updated successfully' });
    });
};

export const deleteAdmin = (req, res) => {
    const { id } = req.params; // Admin ID from request parameters

    const query = `
        DELETE FROM Admins
        WHERE admin_id = ?
    `;

    // Execute the delete query
    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin deleted successfully' });
    });
};
