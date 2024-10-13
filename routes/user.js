import express from "express";
const router=express.Router();

import {get_users,get_user,create_user,update_user,delete_user} from '../controllers/user.js';

router.get('/get_users',get_users);
router.get('/get_user/:id',get_user);
router.put('/update_user/:id',update_user);
router.post('/create_user',create_user);
router.delete('/delete_user/:id',delete_user);


export default router;