import {db} from '../database/db.js';

export const get_all_product_categories = (req, res) => {
    const query = `
        SELECT category_id, category_name
        FROM Categories
    `;

    // Execute the query using the callback-style API
    db.execute(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Check if any categories were found
        if (results.length === 0) {
            return res.status(404).json({ message: 'No product categories found' });
        }

        // Return the results if found
        res.status(200).json(results);
    });
};


export const get_single_category = (req, res) => {
    const categoryId = req.params.id;  // Get category ID from URL

    const query = `
        SELECT category_id, category_name, description, parent_category_id
        FROM Categories
        WHERE category_id = ? 
    `;

    // Execute the query using the callback-style API
    db.execute(query, [categoryId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Check if the category exists
        if (results.length === 0) {
            return res.status(404).json({ message: 'Category not found or deleted' });
        }

        // Return the category details
        res.status(200).json(results[0]);
    });
};


export const create_category = (req, res) => {
    const { category_name, description, parent_category_id } = req.body;

    // Validate required fields
    if (!category_name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    const query = `
        INSERT INTO Categories (category_name, description, parent_category_id)
        VALUES (?, ?, ?)
    `;

    // Execute the insert query using callback style
    db.execute(query, [
        category_name, 
        description || null,       // description is optional
        parent_category_id || null // parent_category_id is optional
    ], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
            message: 'Category created successfully',
            category_id: results.insertId
        });
    });
};


export const update_category = (req, res) => {
    const categoryId = req.params.id;  // Get the category ID from URL
    const { category_name, description, parent_category_id } = req.body;

    // Validate required fields
    if (!category_name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    const query = `
        UPDATE Categories
        SET category_name = ?, description = ?, parent_category_id = ?
        WHERE category_id = ? 
    `;

    // Execute the update query using callback style
    db.execute(query, [
        category_name, 
        description || null,        // Optional field
        parent_category_id || null, // Optional field
        categoryId                  // Category to update
    ], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Check if any rows were affected (i.e., if the category exists and is not deleted)
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found or deleted' });
        }

        res.status(200).json({ message: 'Category updated successfully' });
    });
};


export const delete_category = (req, res) => {
    const categoryId = req.params.id;  // Get the category ID from URL

    const query = `
        DELETE FROM Categories
        WHERE category_id = ?
    `;

    // Execute the delete query using callback style
    db.execute(query, [categoryId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Check if any rows were affected (i.e., if the category existed)
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category permanently deleted' });
    });
};





