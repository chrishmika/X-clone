import express from "express";
import { getme, login, logout, signup } from "../controllers/auth.controller.mjs";
import { protectRoute } from "../middleware/protectRoute.mjs";

const authRouter = express.Router();

authRouter.get("/me", protectRoute, getme);

authRouter.post("/signup", signup);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

export default authRouter;
