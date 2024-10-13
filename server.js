import app from './app.js';
import {db} from './database/db.js';
import { config } from 'dotenv';
import cloudinary from "cloudinary"
// bodyParser=require('body-parser');
// app.use(bodyParser.json());

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});
const Port=process.env.Port;
app.listen(Port,()=>{
    console.log("Server is live now");
})