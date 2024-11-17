import {db} from "../database/db.js"


export const getAllProducts = (req, res) => {
    const query = `
        SELECT * FROM Products;  -- Exclude soft-deleted products
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
        WHERE product_id = ? ;  
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
    const { product_name, description, price, stock_quantity, category_id, brand_id, admin_id, image_url, image, status } = req.body;

    // Validate required fields
    if (!product_name || price === undefined || stock_quantity === undefined) {
        return res.status(400).json({ message: 'Missing required fields (product_name, price, stock_quantity)' });
    }

    // Validate price and stock_quantity
    if (price < 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
    }
    if (stock_quantity < 0) {
        return res.status(400).json({ message: 'Stock quantity must be a positive number' });
    }

    const query = `
        INSERT INTO Products (product_name, description, price, stock_quantity, status, category_id, brand_id, admin_id, image_url, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    // Execute the query
    db.execute(query, [
        product_name,
        description || null,       // Optional description
        price,
        stock_quantity,
        status !== undefined ? status : true,  // Default status to true if not provided
        category_id || null,       // Optional category_id
        brand_id || null,          // Optional brand_id
        admin_id || null,          // Optional admin_id
        image_url || null,         // Optional image_url
        image || null              // Optional image (could be BLOB data)
    ], (err, results) => {
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
    const { product_name, description, price, stock_quantity, category_id, brand_id, status, image_url, image } = req.body; // Product details from request body

    // Check if at least one field to update is provided
    if (!product_name && !description && price === undefined && stock_quantity === undefined && !category_id && !brand_id && status === undefined && !image_url && !image) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    // Build the SQL query dynamically based on provided fields
    const fields = [];
    const values = [];

    // Check each field and add to fields array if provided
    if (product_name) {
        fields.push('product_name = ?');
        values.push(product_name);
    }
    if (description !== undefined) {
        fields.push('description = ?');
        values.push(description || null);  // Allow description to be null
    }
    if (price !== undefined) {
        if (price < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }
        fields.push('price = ?');
        values.push(price);
    }
    if (stock_quantity !== undefined) {
        if (stock_quantity < 0) {
            return res.status(400).json({ message: 'Stock quantity must be a positive number' });
        }
        fields.push('stock_quantity = ?');
        values.push(stock_quantity);
    }
    if (category_id !== undefined) {
        fields.push('category_id = ?');
        values.push(category_id || null);  // Allow category_id to be null
    }
    if (brand_id !== undefined) {
        fields.push('brand_id = ?');
        values.push(brand_id || null);  // Allow brand_id to be null
    }
    if (status !== undefined) {
        fields.push('status = ?');
        values.push(status);
    }
    if (image_url !== undefined) {
        fields.push('image_url = ?');
        values.push(image_url || null);  // Allow image_url to be null
    }
    if (image !== undefined) {
        fields.push('image = ?');
        values.push(image || null);  // Allow image to be null
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

    // Validate that the provided ID is a number
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

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


