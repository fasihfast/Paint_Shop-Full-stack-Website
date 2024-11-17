import jwt from 'jsonwebtoken'; 
import {config} from "dotenv";

export const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Check if the user is an admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access forbidden: Admins only' });
        }

        // Attach user data to the request
        req.user = decoded;
        next(); // Proceed to the next middleware/handler
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Check if Authorization header exists and extract the token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer '

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        // Attach user information from the token to the request object
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};