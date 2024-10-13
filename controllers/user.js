import {db} from '../database/db.js';
import bcrypt from "bcrypt";
import validator from "validator";

export const get_users= async(req,res)=>{
    try{
        const [results]=await db.query('Select * from Users');
        res.status(200).json(results);
    }catch(error){
        res.status(500).json({error: error.message});
    }   
};

export const get_user = async (req, res) => {
    const userId = req.params.user_id;

    const query = `
        SELECT user_id, first_name, last_name, email, phone_number, date_created, last_login
        FROM Users
        WHERE user_id = ? AND deleted_at IS NULL
    `;

    try {
        // Use promise-based version of db.execute
        const [results] = await db.promise().execute(query, [userId]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found or deleted' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};


export const create_user = (req, res) => {
    const { first_name, last_name, email, password, phone_number } = req.body;

    // Check for missing required fields
    if (!first_name || !last_name || !email || !password ) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({
            success: false,
            message:"Not a valid Email format"
        });
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, passwordHash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ error: 'Error hashing password' });
        }

        // Prepare the SQL query for inserting a new user
        const query = `
            INSERT IGNORE INTO Users (first_name, last_name, email, password_hash, phone_number)
            VALUES (?, ?, ?, ?, ?)
        `;

        // Execute the query using callback style
        db.execute(
            query,
            [first_name, last_name, email, passwordHash, phone_number || null],
            (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                // Check if a new user was inserted
                if (results.affectedRows === 0) {
                    return res.status(400).json({ message: 'Email already exists' });
                }

                // Respond with success and the user ID of the newly created user
                res.status(201).json({
                    message: 'User created successfully',
                    user_id: results.insertId,
                });
            }
        );
    });
};



export const update_user = async (req, res) => {
    const userId = req.params.user_id;  // Get user ID from URL
    const { first_name, last_name, email, password, phone_number } = req.body;

    // Check if at least one field to update is provided
    if (!first_name && !last_name && !email && !password && !phone_number) {
        return res.status(400).json({ message: 'No fields provided to update' });
    }

    try {
        const fields = [];
        const values = [];

        // Dynamically build the query based on provided fields
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
        if (password) {
            // Hash the new password if provided
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            fields.push('password_hash = ?');
            values.push(passwordHash);
        }
        if (phone_number) {
            fields.push('phone_number = ?');
            values.push(phone_number);
        }

        // Join the dynamic fields into the SET clause of the SQL query
        const query = `
            UPDATE Users
            SET ${fields.join(', ')}
            WHERE user_id = ? AND deleted_at IS NULL
        `;

        // Add the userId to the values array for the WHERE clause
        values.push(userId);

        // Execute the update query
        const [results] = await db.promise().execute(query, values);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or deleted' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const delete_user = async (req, res) => {
    const userId = parseInt(req.params.id, 10); // Get the user ID from the URL
    console.log(`Received request to delete user with ID: ${userId}`);
    if(isNaN(userId)){
     return  res.status(400).json({
            success:false,
            message:"User_id is not a Valid  number"
        })
    }
    const query = `
        DELETE FROM Users
        WHERE user_id = ?
    `;

    try {
        // Execute the delete query
        const [results] = await db.execute(query, [userId]);  // Destructure results
        console.log('Query results:', results);

        // Check if results is defined and contains affectedRows
        if (results && typeof results.affectedRows === 'number') {
            const affectedRows = results.affectedRows;

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({ message: 'User permanently deleted' });
        } else {
            // Handle unexpected results structure
            console.error('Unexpected result format:', results);
            return res.status(500).json({ error: 'Unexpected result format from database query' });
        }
    } 
    catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};
