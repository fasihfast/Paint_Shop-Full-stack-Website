import {db} from '../database/db.js';

export const createPayment = (req, res) => {
    const { order_id, payment_method, amount } = req.body;

    // Validate required fields
    if (!order_id || !payment_method || !amount) {
        return res.status(400).json({ message: 'Order ID, payment method, and amount are required' });
    }

    const query = `
        INSERT INTO Payments (order_id, payment_method, amount)
        VALUES (?, ?, ?)
    `;

    db.execute(query, [order_id, payment_method, amount], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
            message: 'Payment created successfully',
            payment_id: results.insertId,
        });
    });
};

export const getAllPayments = (req, res) => {
    const query = `
        SELECT payment_id, order_id, payment_method, payment_date, amount, status
        FROM Payments
    `;

    db.execute(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(200).json(results);
    });
};

export const getPaymentsByOrder = (req, res) => {
    const { orderId } = req.params;

    const query = `
        SELECT payment_id, payment_method, payment_date, amount, status
        FROM Payments
        WHERE order_id = ?
    `;

    db.execute(query, [orderId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No payments found for the specified order' });
        }

        res.status(200).json(results);
    });
};

export const updatePaymentStatus = (req, res) => {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Payment status is required' });
    }

    const query = `
        UPDATE Payments
        SET status = ?
        WHERE payment_id = ?
    `;

    db.execute(query, [status, paymentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json({ message: 'Payment status updated successfully' });
    });
};

export const deletePayment = (req, res) => {
    const { paymentId } = req.params;

    const query = `DELETE FROM Payments WHERE payment_id = ?`;

    db.execute(query, [paymentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json({ message: 'Payment deleted successfully' });
    });
};
