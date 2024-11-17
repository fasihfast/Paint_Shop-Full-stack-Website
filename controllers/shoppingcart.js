import {db} from '../database/db.js';

export const getAllShoppingCarts = (req, res) => {
    const query = `
        SELECT cart_id, user_id, created_at, admin_id
        FROM ShoppingCart
    `;

    // Execute the query
    db.execute(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No shopping carts found' });
        }

        res.status(200).json(results);
    });
};

export const getShoppingCartById = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT sc.cart_id, sc.user_id, sc.created_at, sc.admin_id, u.first_name AS user_name, a.first_name AS admin_name
        FROM ShoppingCart sc
        LEFT JOIN Users u ON sc.user_id = u.user_id
        LEFT JOIN Admins a ON sc.admin_id = a.admin_id
        WHERE sc.cart_id = ?;
    `;

    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Shopping cart not found' });
        }

        res.status(200).json(results[0]);
    });
};

export const createShoppingCart = (req, res) => {
    const { user_id, admin_id } = req.body;

    const query = `
        INSERT INTO ShoppingCart (user_id, admin_id)
        VALUES (?, ?);
    `;

    db.execute(query, [user_id || null, admin_id || null], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
            message: 'Shopping cart created successfully',
            cart_id: results.insertId,
        });
    });
};


export const updateShoppingCart = (req, res) => {
    const { id } = req.params;
    const { user_id, admin_id } = req.body;

    const query = `
        UPDATE ShoppingCart
        SET user_id = ?, admin_id = ?
        WHERE cart_id = ?;
    `;

    db.execute(query, [user_id || null, admin_id || null, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Shopping cart not found' });
        }

        res.status(200).json({ message: 'Shopping cart updated successfully' });
    });
};

export const deleteShoppingCart = (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM ShoppingCart
        WHERE cart_id = ?;
    `;

    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Shopping cart not found' });
        }

        res.status(200).json({ message: 'Shopping cart deleted successfully' });
    });
};

