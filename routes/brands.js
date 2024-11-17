import express from "express";
const router=express.Router();

import {createBrand,getAllBrands,getBrandById,updateBrandById,deleteBrandById} from "../controllers/brands.js"

router.get("/getAllBrands",getAllBrands);
router.get("/getBrandsById/:id",getBrandById);
router.post("/createBrand",createBrand);
router.put("/updateBrandById/:id",updateBrandById)
router.delete("/deleteBrandById/:id",deleteBrandById);

export default router;