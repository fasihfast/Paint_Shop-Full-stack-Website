import express from "express";
import { config } from "dotenv";
import cors from 'cors';
import cookieParser from "cookie-parser";
import fileUpload from 'express-fileupload';
import {db} from "./database/db.js";
import userRouter from "./routes/user.js";
import { delete_user } from "./controllers/user.js";
import router from "./routes/user.js";

const app=express();
config({path: "./config/config.env"});
app.use(cors({
    origin: [process.env.FRONTEND_URL,process.env.DASHBOARD_URL],
    methods: ["GET","POST","PUT","DELETE"],
    Credential: true,
}))


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(fileUpload({

    useTempFiles: true,
    TempFileDir: "/tmp/",
}));

app.use("/api/v1",userRouter);


// db.query(create_user);


// create_user();
// db.execute();
export default app;
