import express from "express";
const router=express.Router();

import {getAllProducts,getProductById,createProduct,updateProductById,deleteProductById} from "../controllers/product"

router.get('/getAllProducts',getAllProducts);
router.get('/getProductById',getProductById);
router.post('/createProduct',createProduct);
router.put('/updateProductById',updateProductById);
router.delete('/deleteProductById',deleteProductById);


export default router;

