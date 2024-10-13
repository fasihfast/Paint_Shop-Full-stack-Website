import {db} from '../database/db.js';

export const get_all_product_categories = async (req, res) => {
    const query = `
        SELECT category_id, category_name
        FROM Categories
        WHERE deleted_at IS NULL
    `;

    try {
        // Execute the query
        const [results] = await db.promise().execute(query);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No product categories found' });
        }

        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const get_single_category = async (req, res) => {
    const categoryId = req.params.id;  // Get category ID from URL

    const query = `
        SELECT category_id, category_name, description, parent_category_id
        FROM Categories
        WHERE category_id = ? AND deleted_at IS NULL
    `;

    try {
        // Execute the query with the category ID
        const [results] = await db.promise().execute(query, [categoryId]);

        // Check if the category exists
        if (results.length === 0) {
            return res.status(404).json({ message: 'Category not found or deleted' });
        }

        res.status(200).json(results[0]);  // Return the category details
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const create_category = async (req, res) => {
    const { category_name, description, parent_category_id } = req.body;

    // Validate required fields
    if (!category_name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const query = `
            INSERT INTO Categories (category_name, description, parent_category_id)
            VALUES (?, ?, ?)
        `;

        // Execute the insert query
        const [results] = await db.promise().execute(query, [
            category_name, 
            description || null,       // description is optional
            parent_category_id || null // parent_category_id is optional
        ]);

        res.status(201).json({
            message: 'Category created successfully',
            category_id: results.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const update_category = async (req, res) => {
    const categoryId = req.params.id;  // Get the category ID from URL
    const { category_name, description, parent_category_id } = req.body;

    // Validate required fields
    if (!category_name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    const query = `
        UPDATE Categories
        SET category_name = ?, description = ?, parent_category_id = ?
        WHERE category_id = ? AND deleted_at IS NULL
    `;

    try {
        // Execute the update query
        const [results] = await db.promise().execute(query, [
            category_name, 
            description || null,        // Optional field
            parent_category_id || null, // Optional field
            categoryId                  // Category to update
        ]);

        // Check if any rows were affected (i.e., if the category exists and is not deleted)
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found or deleted' });
        }

        res.status(200).json({ message: 'Category updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

export const delete_category = async (req, res) => {
    const categoryId = req.params.id;  // Get the category ID from URL

    const query = `
        DELETE FROM Categories
        WHERE category_id = ?
    `;

    try {
        // Execute the delete query
        const [results] = await db.promise().execute(query, [categoryId]);

        // Check if any rows were affected (i.e., if the category existed)
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category permanently deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};




