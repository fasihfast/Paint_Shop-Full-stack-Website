import {db} from "../database/db.js"


export const getAllProducts = (req, res) => {
    const query = `
        SELECT * FROM Products
        WHERE deleted_at IS NULL;  -- Exclude soft-deleted products
    `;

    // Execute the query
    db.execute(query, (err, results) => {
        // Error handling
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Respond with the results if there are no errors
        res.status(200).json(results);
    });
};

export const getProductById = (req, res) => {
    const productId = req.params.id; // Get the product ID from the URL parameters

    // Validate that productId is a number
    if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    const query = `
        SELECT * FROM Products
        WHERE product_id = ? AND deleted_at IS NULL;  -- Exclude soft-deleted products
    `;

    // Execute the query
    db.execute(query, [productId], (err, results) => {
        // Error handling
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Check if the product exists
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Respond with the product details
        res.status(200).json(results[0]); // Return the first (and only) result
    });
};

export const createProduct = (req, res) => {
    const { product_name, category_id, brand_id, status } = req.body;

    // Check for missing required fields
    if (!product_name) {
        return res.status(400).json({ message: 'Product name is required' });
    }

    const query = `
        INSERT INTO Products (product_name, category_id, brand_id, status)
        VALUES (?, ?, ?, ?);
    `;

    // Execute the query
    db.execute(query, [product_name, category_id || null, brand_id || null, status || true], (err, results) => {
        // Error handling
        if (err) {
            console.error('Database error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Product already exists' });
            }
            return res.status(500).json({ error: 'Database error' });
        }

        // Respond with success and the ID of the newly created product
        res.status(201).json({
            message: 'Product created successfully',
            product_id: results.insertId, // Return the ID of the newly created product
        });
    });
};

export const updateProductById = (req, res) => {
    const { id } = req.params; // Get product ID from the request parameters
    const { product_name, category_id, brand_id, status } = req.body; // Product details from request body

    // Check if at least one field to update is provided
    if (!product_name && !category_id && !brand_id && status === undefined) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    // Build the SQL query dynamically based on provided fields
    const fields = [];
    const values = [];

    if (product_name) {
        fields.push('product_name = ?');
        values.push(product_name);
    }
    if (category_id) {
        fields.push('category_id = ?');
        values.push(category_id);
    }
    if (brand_id) {
        fields.push('brand_id = ?');
        values.push(brand_id);
    }
    if (status !== undefined) {
        fields.push('status = ?');
        values.push(status);
    }

    // Add product ID to the values array for the WHERE clause
    values.push(id);

    const query = `UPDATE Products SET ${fields.join(', ')} WHERE product_id = ?`;

    // Execute the query
    db.execute(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully' });
    });
};

export const deleteProductById = (req, res) => {
    const { id } = req.params; // Get product ID from request parameters

    const query = `DELETE FROM Products WHERE product_id = ?`;

    // Execute the delete query
    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    });
};

