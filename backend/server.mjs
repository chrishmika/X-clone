import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import connectMongoDB from "./db/connectMongoDB.mjs";

import userRouter from "./routes/user.route.mjs";
import authRouter from "./routes/auth.route.mjs";
import postRouter from "./routes/post.route.mjs";
import notificationRoutes from "./routes/notification.route.mjs";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json()); //to parse req.body
app.use(express.urlencoded({ extended: true })); //to parse data from urlencoded
app.use(cookieParser()); //to parse cookies

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/notification", notificationRoutes);

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
connectMongoDB();
