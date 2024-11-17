import express from 'express';
const router = express.Router();
import { authenticateAdmin,authenticateUser } from '../middleware/authmiddleware.js';
import {createPayment,getAllPayments,getPaymentsByOrder,updatePaymentStatus,deletePayment} from "../controllers/payment.js"


router.post('/createPayment', authenticateUser, createPayment); // User creates a payment
router.get('/admin/getAllPayments', authenticateAdmin, getAllPayments); // Admin views all payments
router.get('/getPaymentsByOrder/:orderId', authenticateUser, getPaymentsByOrder); // User views payments for their order
router.put('/admin/updatePaymentStatus/:paymentId', authenticateAdmin, updatePaymentStatus); // Admin updates payment status
router.delete('/admin/deletePayment/:paymentId', authenticateAdmin, deletePayment); // Admin deletes a payment

export default router;