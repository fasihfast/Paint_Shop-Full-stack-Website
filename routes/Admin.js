import express from "express";
const router=express.Router();

import {getAllAdmins,getAdminById,loginAdmin,changeAdminPassword,updateAdminInfo,deleteAdmin, createAdmin} from "../controllers/Admin.js"

router.get("/getAllAdmins",getAllAdmins);
router.get("/getAdminById/:id",getAdminById);
router.post("/loginAdmin",loginAdmin);
router.post("/createAdmin",createAdmin);
router.put("/changeAdminPassword/:id",changeAdminPassword);
router.put("/updateAdminInfo/:id",updateAdminInfo);
router.delete("/deleteAdmin/:id",deleteAdmin);

export default router;