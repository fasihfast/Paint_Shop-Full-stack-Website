import {db} from '../database/db.js';
import bcrypt from "bcrypt";
import validator from "validator";

export const get_users = (req, res) => {
    db.query('SELECT * FROM Users', (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};


export const get_user = (req, res) => {
    const userId = req.params.id;

    console.log('User ID:', userId);
    const query = `
        SELECT user_id, first_name, last_name, email, phone_number1, phone_number2, date_created, last_login
        FROM Users
        WHERE user_id = ? `;

    // Execute the query with a callback
    db.execute(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Check if the user was found
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found or deleted' });
        }

        // Respond with the user data
        res.json(results[0]);
    });
};



export const create_user = (req, res) => {
    const { 
        first_name, 
        last_name, 
        email, 
        password, 
        phone_number1, 
        phone_number2, 
        street_address, 
        city, 
        province, 
        country, 
        gmaplink 
    } = req.body;

    // Function to validate an 11-digit phone number with optional dashes
    const isValidPhoneNumber = (number) => {
        return /^[0-9]{4}-?[0-9]{7}$/.test(number); // Matches 11 digits with optional dashes
    };

    // Check for missing required fields
    if (!first_name || !last_name || !email || !password || !street_address || !city || !province || !country) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Not a valid Email format"
        });
    }

    // Validate phone numbers (if provided)
    if (phone_number1 && !isValidPhoneNumber(phone_number1)) {
        return res.status(400).json({
            success: false,
            message: "Phone number 1 is invalid. It must be an 11-digit number with optional dashes."
        });
    }

    if (phone_number2 && !isValidPhoneNumber(phone_number2)) {
        return res.status(400).json({
            success: false,
            message: "Phone number 2 is invalid. It must be an 11-digit number with optional dashes."
        });
    }

    // Validate province - it should be one of the specified values
    const validProvinces = ['Sindh', 'Balochistan', 'Punjab', 'Khyber Pakhtunkhwa', 'Kashmir'];
    if (!validProvinces.includes(province)) {
        return res.status(400).json({
            success: false,
            message: `Invalid province. Valid options are: ${validProvinces.join(', ')}`
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
            INSERT IGNORE INTO Users (first_name, last_name, email, password_hash, phone_number1, phone_number2, street_address, city, province, country, gmaplink)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Execute the query using callback style
        db.execute(
            query,
            [
                first_name,
                last_name,
                email,
                passwordHash,
                phone_number1 || null,  // Allow phone_number1 to be null if not provided
                phone_number2 || null,  // Allow phone_number2 to be null if not provided
                street_address,
                city,
                province,
                country,
                gmaplink || null  // Allow gmaplink to be null if not provided
            ],
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





export const update_user = (req, res) => {
    const userId = req.params.id; // Get user ID from URL
    const { 
        first_name, 
        last_name, 
        email, 
        password, 
        phone_number1, 
        phone_number2, 
        street_address, 
        city, 
        province, 
        country 
    } = req.body;

    // Check if at least one field to update is provided
    if (
        !first_name &&
        !last_name &&
        !email &&
        !password &&
        !phone_number1 &&
        !phone_number2 &&
        !street_address &&
        !city &&
        !province &&
        !country
    ) {
        return res.status(400).json({ message: 'No fields provided to update' });
    }

    const fields = [];
    const values = [];

    const isValidPhoneNumber = (number) => {
        return /^[0-9]{4}-?[0-9]{7}$/.test(number); // Matches 11 digits with optional dashes
    };

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
        // Hash the new password synchronously
        try {
            const saltRounds = 10;
            const passwordHash = require('bcrypt').hashSync(password, saltRounds);
            fields.push('password_hash = ?');
            values.push(passwordHash);
        } catch (error) {
            console.error('Error hashing password:', error);
            return res.status(500).json({ error: 'Error hashing password' });
        }
    }
    if (phone_number1) {
        if (phone_number1 && !isValidPhoneNumber(phone_number1)) {
            return res.status(400).json({
                success: false,
                message: "Phone number 1 is invalid. It must be an 11-digit number with optional dashes."
            });
        }
    else{
        fields.push('phone_number1 = ?');
        values.push(phone_number1);
    }
    }
    if (phone_number2) {
        if (phone_number2 && !isValidPhoneNumber(phone_number2)) {
            return res.status(400).json({
                success: false,
                message: "Phone number 2 is invalid. It must be an 11-digit number with optional dashes."
            });
        }
        else{
        fields.push('phone_number2 = ?');
        values.push(phone_number2);
        }
    }
    if (street_address) {
        fields.push('street_address = ?');
        values.push(street_address);
    }
    if (city) {
        fields.push('city = ?');
        values.push(city);
    }
    if (province) {
        fields.push('province = ?');
        values.push(province);
    }
    if (country) {
        fields.push('country = ?');
        values.push(country);
    }

    // Join the dynamic fields into the SET clause of the SQL query
    const query = `
        UPDATE Users
        SET ${fields.join(', ')}
        WHERE user_id = ? `;

    // Add the userId to the values array for the WHERE clause
    values.push(userId);

    // Execute the update query using callback style
    db.query(query, values, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Email already exists' });
            }
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or deleted' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    });
};


export const delete_user = (req, res) => {
    const userId = parseInt(req.params.id, 10); // Get the user ID from the URL
    console.log(`Received request to delete user with ID: ${userId}`);

    // Validate the user ID
    if (isNaN(userId)) {
        return res.status(400).json({
            success: false,
            message: "User_id is not a valid number",
        });
    }

    // Define the query
    const query = `
        DELETE FROM Users
        WHERE user_id = ?
    `;

    // Execute the query using a callback
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log('Query results:', results);

        // Check if results contain affectedRows
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
    });
};

