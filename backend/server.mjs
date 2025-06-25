import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import connectMongoDB from "./db/connectMongoDB.mjs";

import userRouter from "./routes/user.route.mjs";
import authRouter from "./routes/auth.route.mjs";
import postRouter from "./routes/post.route.mjs";
import notificationRoutes from "./routes/notification.route.mjs";
import path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" })); //to parse req.body
app.use(express.urlencoded({ extended: true })); //to parse data from urlencoded
app.use(cookieParser()); //to parse cookies

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/notification", notificationRoutes);

//this is used to send frontend endpoint request to frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  //this is used to send frontend endpoint request to frontend
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
connectMongoDB();
