import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectMongoDB from "./db/connectMongoDB.mjs";

import userRouter from "./routes/user.routes.mjs";
import authRouter from "./routes/auth.routes.mjs";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json()); //to parse req.body
app.use(express.urlencoded({ extended: true })); //to parse data from urlencoded
app.use(cookieParser()); //to parse cookies

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
connectMongoDB();
