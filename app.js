import express from "express";
import { config } from "dotenv";
import cors from 'cors';
import cookieParser from "cookie-parser";
import fileUpload from 'express-fileupload';
// import {db} from "./database/db.js";
import userRouter from "./routes/user.js";
import categoryRouter from "./routes/categories.js";
import productRouter from "./routes/products.js";
import brandRouter from "./routes/brands.js";
import adminRouter from "./routes/Admin.js";
import cartRouter from "./routes/cartitems.js";
import shoppingcartRouter from "./routes/shoppingcart.js";
import orderRouter from "./routes/order.js";
import orderitemRouter from "./routes/orderitems.js";
import paymentRouter from "./routes/payment.js";
// import { delete_user } from "./controllers/user.js";
// import router from "./routes/user.js";

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
app.use("/api/v1",categoryRouter);
app.use("/api/v1",productRouter);
app.use("/api/v1",brandRouter);
app.use("/api/v1",adminRouter);
app.use("/api/v1",cartRouter);
app.use("/api/v1",shoppingcartRouter);
app.use("/api/v1",orderRouter);
app.use("/api/v1",orderitemRouter);
app.use("/api/v1",paymentRouter);


export default app;
