import express from "express";
import dotenv from "dotenv";

import router from "./routes/auth.routes.mjs";
import connectMongoDB from "./db/connectMongoDB.mjs";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json()); //to parse req.body
app.use(express.urlencoded({ extended: true })); //to parse data from urlencoded

app.use("/api/auth", router);

app.listen(PORT, () => console.log(`server is running on ${PORT}`));
connectMongoDB();
