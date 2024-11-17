import express from 'express';
const router = express.Router();
import { authenticateAdmin } from '../middleware/authmiddleware.js';
import {createOrder,getAllOrders,getOrderById,updateOrderStatus,deleteOrder,getOrdersByUserId} from "../controllers/order.js"

router.post('/createOrder',createOrder);
router.get('/getOrderById/:id',getOrderById);
router.get('/orders',authenticateAdmin,getAllOrders);
router.get('/getOrderByUserId/:id',getOrdersByUserId);
router.put('/updateOrderStatus/:id',updateOrderStatus);
router.delete('/deleteOrder/:id',deleteOrder);

export default router;