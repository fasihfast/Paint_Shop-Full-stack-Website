import {db} from '../database/db.js';

export const createOrder = (req, res) => {
    const { user_id, total_amount, order_status, admin_id } = req.body;

    // Validate required fields
    if (!user_id || total_amount === undefined) {
        return res.status(400).json({ message: 'User ID and total amount are required' });
    }

    const query = `
        INSERT INTO Orders (user_id, total_amount, order_status, admin_id)
        VALUES (?, ?, ?, ?)
    `;

    db.execute(query, [user_id, total_amount, order_status || 'Pending', admin_id || null], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
            message: 'Order created successfully',
            order_id: results.insertId,
        });
    });
};

export const getAllOrders = (req, res) => {
    const query = `
        SELECT order_id, user_id, order_date, total_amount, order_status, admin_id
        FROM Orders
    `;

    db.execute(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        res.status(200).json(results);
    });
};

export const getOrderById = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT order_id, user_id, order_date, total_amount, order_status, admin_id
        FROM Orders
        WHERE order_id = ?
    `;

    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(results[0]);
    });
};

export const updateOrderStatus = (req, res) => {
    const { id } = req.params;
    const { order_status } = req.body;

    // Validate the new order status
    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(order_status)) {
        return res.status(400).json({ message: `Invalid order status. Valid statuses are: ${validStatuses.join(', ')}` });
    }

    const query = `
        UPDATE Orders
        SET order_status = ?
        WHERE order_id = ?
    `;

    db.execute(query, [order_status, id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully' });
    });
};

export const deleteOrder = (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM Orders
        WHERE order_id = ?
    `;

    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order deleted successfully' });
    });
};

export const getOrdersByUserId = (req, res) => {
    const { user_id } = req.params;

    const query = `
        SELECT order_id, order_date, total_amount, order_status
        FROM Orders
        WHERE user_id = ?
    `;

    db.execute(query, [user_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.status(200).json(results);
    });
};
