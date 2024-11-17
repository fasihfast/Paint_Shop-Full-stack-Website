import {db} from '../database/db.js';

export const createBrand = (req, res) => {
    const { brand_name, description, admin_id } = req.body;

    // Check for missing required fields
    if (!brand_name) {
        return res.status(400).json({ message: 'Brand name is required' });
    }

    const query = `
        INSERT INTO Brands (brand_name, description, admin_id)
        VALUES (?, ?, ?)
    `;

    db.execute(query, [brand_name, description || null, admin_id || null], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
            message: 'Brand created successfully',
            brand_id: results.insertId
        });
    });
};

export const getAllBrands = (req, res) => {
    const query = `
        SELECT brand_id, brand_name, description, admin_id
        FROM Brands
    `;

    db.execute(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No brands found' });
        }

        res.status(200).json(results);
    });
};

export const getBrandById = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT brand_id, brand_name, description, admin_id
        FROM Brands
        WHERE brand_id = ?
    `;

    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.status(200).json(results[0]);
    });
};

export const updateBrandById = (req, res) => {
    const { id } = req.params;
    const { brand_name, description, admin_id } = req.body;

    // Check if at least one field to update is provided
    if (!brand_name && !description && admin_id === undefined) {
        return res.status(400).json({ message: 'No fields provided for update' });
    }

    const fields = [];
    const values = [];

    if (brand_name) {
        fields.push('brand_name = ?');
        values.push(brand_name);
    }

    if (description) {
        fields.push('description = ?');
        values.push(description);
    }

    if (admin_id !== undefined) {
        fields.push('admin_id = ?');
        values.push(admin_id);
    }

    // Add brand ID to the values array for the WHERE clause
    values.push(id);

    const query = `UPDATE Brands SET ${fields.join(', ')} WHERE brand_id = ?`;

    db.execute(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.status(200).json({ message: 'Brand updated successfully' });
    });
};

export const deleteBrandById = (req, res) => {
    const { id } = req.params;

    const query = `
        DELETE FROM Brands WHERE brand_id = ?
    `;

    db.execute(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.status(200).json({ message: 'Brand deleted successfully' });
    });
};

