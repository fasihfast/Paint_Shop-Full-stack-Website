import express from "express";
const router=express.Router();

import {get_all_product_categories,get_single_category,create_category,update_category,delete_category} from '../controllers/categories.js';


router.get('/get_all_product_categories',get_all_product_categories);
router.get('/get_single_category/:id',get_single_category);
router.post('/create_category',create_category);
router.put('/update_category/:id',update_category);
router.delete('/delete_category/:id',delete_category);

export default router;
