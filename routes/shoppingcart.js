import express from 'express';
const router = express.Router();

import { authenticateAdmin } from '../middleware/authmiddleware.js';
import { getAllShoppingCarts,getShoppingCartById,createShoppingCart,updateShoppingCart,deleteShoppingCart } from '../controllers/shoppingcart.js';

router.get('/shopping-carts', authenticateAdmin, getAllShoppingCarts); // Restrict access to admins
router.get('/getShoppingCartById/:id',getShoppingCartById);
router.post('/createShoppingCart',createShoppingCart);
router.put('/updateShoppingCart/:id',updateShoppingCart);
router.delete('/deleteShoppingCart/:id',deleteShoppingCart);

export default router;
