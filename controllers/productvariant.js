import {db} from '../database/db.js';

export const createProductVariant = (req, res) => {
    const { product_id, size, color, price, stock_quantity } = req.body;

    // Validate required fields
    if (!product_id || !size || !color || !price) {
        return res.status(400).json({ message: 'Product ID, size, color, and price are required' });
    }

    const query = `
        INSERT INTO ProductVariants (product_id, size, color, price, stock_quantity, admin_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.execute(
        query,
        [product_id, size, color, price, stock_quantity || 0, req.admin.id],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({
                message: 'Product variant created successfully',
                variant_id: results.insertId,
            });
        }
    );
};

export const getProductVariants = (req, res) => {
    const { productId } = req.params;

    const query = `
        SELECT variant_id, size, color, price, stock_quantity
        FROM ProductVariants
        WHERE product_id = ?
    `;

    db.execute(query, [productId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(200).json(results);
    });
};

export const updateProductVariant = (req, res) => {
    const { variantId } = req.params;
    const { size, color, price, stock_quantity } = req.body;

    // Ensure at least one field to update is provided
    if (!size && !color && !price && stock_quantity === undefined) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    const fields = [];
    const values = [];

    if (size) {
        fields.push('size = ?');
        values.push(size);
    }
    if (color) {
        fields.push('color = ?');
        values.push(color);
    }
    if (price !== undefined) {
        fields.push('price = ?');
        values.push(price);
    }
    if (stock_quantity !== undefined) {
        fields.push('stock_quantity = ?');
        values.push(stock_quantity);
    }

    values.push(variantId);

    const query = `UPDATE ProductVariants SET ${fields.join(', ')} WHERE variant_id = ?`;

    db.execute(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product variant not found' });
        }

        res.status(200).json({ message: 'Product variant updated successfully' });
    });
};

export const deleteProductVariant = (req, res) => {
    const { variantId } = req.params;

    const query = `DELETE FROM ProductVariants WHERE variant_id = ?`;

    db.execute(query, [variantId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product variant not found' });
        }

        res.status(200).json({ message: 'Product variant deleted successfully' });
    });
};

export const getProductVariantById = (req, res) => {
    const { variantId } = req.params;

    const query = `
        SELECT variant_id, product_id, size, color, price, stock_quantity
        FROM ProductVariants
        WHERE variant_id = ?
    `;

    db.execute(query, [variantId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Product variant not found' });
        }

        res.status(200).json(results[0]);
    });
};

