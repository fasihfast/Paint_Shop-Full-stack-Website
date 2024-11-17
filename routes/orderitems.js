import express from 'express';
const router = express.Router();
import { authenticateAdmin,authenticateUser } from '../middleware/authmiddleware.js';
import {getOrderItemsByOrderId,createOrderItem,updateOrderItem,deleteOrderItem,getAllOrderItems,deleteOrderItemByAdmin,updateOrderItemByAdmin} from "../controllers/orderitem.js";

router.get('/getOrderItemByOrderId/:id',authenticateUser,getOrderItemsByOrderId);
router.post('/createOrderItem',authenticateUser,createOrderItem);
router.put('/updateOrderItem/:id',authenticateUser,updateOrderItem);
router.delete('/deleteOrderItem/:id',authenticateUser,deleteOrderItem);

router.get('/getAllOrderItems',authenticateAdmin,getAllOrderItems);
router.delete('/deleteOrderItemByAdmin/:id',authenticateAdmin,deleteOrderItemByAdmin);
router.put('/updateOrderItemByAdmin/:id',authenticateAdmin,updateOrderItemByAdmin);

export default router;