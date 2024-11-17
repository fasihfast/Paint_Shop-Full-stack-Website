import express from "express";
const router=express.Router();

import {getAllProducts,getProductById,createProduct,updateProductById,deleteProductById} from "../controllers/product.js"

router.get('/getAllProducts',getAllProducts);
router.get('/getProductById/:id',getProductById);
router.post('/createProduct',createProduct);
router.put('/updateProductById/:id',updateProductById);
router.delete('/deleteProductById/:id',deleteProductById);


export default router;

