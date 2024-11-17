import express from "express";
const router=express.Router();

import {getCartItems,addCartItem,updateCartItem,deleteCartItem,clearCart} from '../controllers/cartitems.js';

router.get('/getCartItems/:id',getCartItems);
router.post('/addCartItem',addCartItem);
router.put('/updateCartItem/:id',updateCartItem);
router.delete('/deleteCartItem/:id',deleteCartItem);
router.delete('/clearCart/:id',clearCart);

export default router;