import {db} from '../database/db.js'

export const getOrderItemsByOrderId = (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id; // Extract user ID from authenticated token

    const query = `
        SELECT oi.order_item_id, oi.product_id, oi.variant_id, oi.quantity, oi.price_at_purchase
        FROM OrderItems oi
        INNER JOIN Orders o ON oi.order_id = o.order_id
        WHERE oi.order_id = ? AND o.user_id = ?
    `;

    db.execute(query, [orderId, userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No order items found for this order or access denied' });
        }

        res.status(200).json(results);
    });
};

export const createOrderItem = (req, res) => {
    const { orderId, productId, variantId, quantity, priceAtPurchase } = req.body;
    const userId = req.user.id; // Ensure the authenticated user owns the order

    if (!orderId || !productId || !variantId || !quantity || !priceAtPurchase) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const orderOwnershipQuery = `SELECT user_id FROM Orders WHERE order_id = ?`;

    // Check if the user owns the order
    db.execute(orderOwnershipQuery, [orderId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0 || results[0].user_id !== userId) {
            return res.status(403).json({ message: 'Access denied to this order' });
        }

        const insertQuery = `
            INSERT INTO OrderItems (order_id, product_id, variant_id, quantity, price_at_purchase)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.execute(insertQuery, [orderId, productId, variantId, quantity, priceAtPurchase], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({
                message: 'Order item created successfully',
                order_item_id: results.insertId,
            });
        });
    });
};

export const updateOrderItem = (req, res) => {
    const { orderItemId } = req.params;
    const { quantity, priceAtPurchase } = req.body;
    const userId = req.user.id;

    if (!quantity && !priceAtPurchase) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    const orderOwnershipQuery = `
        SELECT o.user_id 
        FROM OrderItems oi
        INNER JOIN Orders o ON oi.order_id = o.order_id
        WHERE oi.order_item_id = ?
    `;

    db.execute(orderOwnershipQuery, [orderItemId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0 || results[0].user_id !== userId) {
            return res.status(403).json({ message: 'Access denied to this order item' });
        }

        const updateFields = [];
        const values = [];

        if (quantity) {
            updateFields.push('quantity = ?');
            values.push(quantity);
        }
        if (priceAtPurchase) {
            updateFields.push('price_at_purchase = ?');
            values.push(priceAtPurchase);
        }

        values.push(orderItemId);

        const updateQuery = `UPDATE OrderItems SET ${updateFields.join(', ')} WHERE order_item_id = ?`;

        db.execute(updateQuery, values, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Order item not found' });
            }

            res.status(200).json({ message: 'Order item updated successfully' });
        });
    });
};

export const deleteOrderItem = (req, res) => {
    const { orderItemId } = req.params;
    const userId = req.user.id;

    const orderOwnershipQuery = `
        SELECT o.user_id 
        FROM OrderItems oi
        INNER JOIN Orders o ON oi.order_id = o.order_id
        WHERE oi.order_item_id = ?
    `;

    db.execute(orderOwnershipQuery, [orderItemId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0 || results[0].user_id !== userId) {
            return res.status(403).json({ message: 'Access denied to this order item' });
        }

        const deleteQuery = `DELETE FROM OrderItems WHERE order_item_id = ?`;

        db.execute(deleteQuery, [orderItemId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Order item not found' });
            }

            res.status(200).json({ message: 'Order item deleted successfully' });
        });
    });
};

export const getAllOrderItems = (req, res) => {
    const query = `
        SELECT oi.order_item_id, oi.order_id, oi.product_id, oi.variant_id, oi.quantity, oi.price_at_purchase
        FROM OrderItems oi
    `;

    db.execute(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(200).json(results);
    });
};

export const deleteOrderItemByAdmin = (req, res) => {
    const { orderItemId } = req.params;

    const query = `DELETE FROM OrderItems WHERE order_item_id = ?`;

    db.execute(query, [orderItemId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        res.status(200).json({ message: 'Order item deleted successfully by admin' });
    });
};

export const updateOrderItemByAdmin = (req, res) => {
    const { orderItemId } = req.params;
    const { quantity, priceAtPurchase } = req.body;

    if (!quantity && !priceAtPurchase) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    const updateFields = [];
    const values = [];

    if (quantity) {
        updateFields.push('quantity = ?');
        values.push(quantity);
    }
    if (priceAtPurchase) {
        updateFields.push('price_at_purchase = ?');
        values.push(priceAtPurchase);
    }

    values.push(orderItemId);

    const query = `UPDATE OrderItems SET ${updateFields.join(', ')} WHERE order_item_id = ?`;

    db.execute(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        res.status(200).json({ message: 'Order item updated successfully by admin' });
    });
};


