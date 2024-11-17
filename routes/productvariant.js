import express from 'express';
const router = express.Router();
import { authenticateAdmin,authenticateUser } from '../middleware/authmiddleware.js';

router.post('/createProductVariant', authenticateAdmin, createProductVariant); // Admin creates a product variant
router.get('/getProductVariants/:productId', getProductVariants); // Get all variants for a product
router.get('/getProductVariant/:variantId', getProductVariantById); // Get details of a specific variant
router.put('/updateProductVariant/:variantId', authenticateAdmin, updateProductVariant); // Admin updates a variant
router.delete('/deleteProductVariant/:variantId', authenticateAdmin, deleteProductVariant); // Admin deletes a variant

export default router;