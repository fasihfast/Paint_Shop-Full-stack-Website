import {db} from '../database/db.js';

export const getCartItems = (req, res) => {
    const { cart_id } = req.params;

    if (!cart_id) {
        return res.status(400).json({ message: 'Cart ID is required' });
    }

    const query = `
        SELECT ci.cart_item_id, ci.quantity, ci.product_id, ci.variant_id, 
               p.product_name, pv.variant_name
        FROM CartItems ci
        JOIN Products p ON ci.product_id = p.product_id
        LEFT JOIN ProductVariants pv ON ci.variant_id = pv.variant_id
        WHERE ci.cart_id = ?
    `;

    db.execute(query, [cart_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(200).json(results);
    });
};


export const addCartItem = (req, res) => {
    const { cart_id, product_id, variant_id, quantity } = req.body;

    if (!cart_id || !product_id || !quantity) {
        return res.status(400).json({ message: 'Cart ID, Product ID, and Quantity are required' });
    }

    const query = `
        INSERT INTO CartItems (cart_id, product_id, variant_id, quantity)
        VALUES (?, ?, ?, ?)
    `;

    db.execute(query, [cart_id, product_id, variant_id || null, quantity], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
            message: 'Item added to cart',
            cart_item_id: results.insertId,
        });
    });
};

export const updateCartItem = (req, res) => {
    const { cart_item_id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const query = `
        UPDATE CartItems
        SET quantity = ?
        WHERE cart_item_id = ?
    `;

    db.execute(query, [quantity, cart_item_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Cart item updated successfully' });
    });
};

export const deleteCartItem = (req, res) => {
    const { cart_item_id } = req.params;

    const query = `
        DELETE FROM CartItems
        WHERE cart_item_id = ?
    `;

    db.execute(query, [cart_item_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Cart item deleted successfully' });
    });
};

export const clearCart = (req, res) => {
    const { cart_id } = req.params;

    if (!cart_id) {
        return res.status(400).json({ message: 'Cart ID is required' });
    }

    const query = `
        DELETE FROM CartItems
        WHERE cart_id = ?
    `;

    db.execute(query, [cart_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(200).json({
            message: 'All items cleared from cart',
            affectedRows: results.affectedRows,
        });
    });
};

