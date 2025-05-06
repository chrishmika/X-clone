import express from "express";
import { protectRoute } from "../middleware/protectRoute.mjs";
import { commentOnPost, createPost, deletePost, getAllPost, likeUnlikePost, updatePost } from "../controllers/post.controller.mjs";

const postRouter = express.Router();

postRouter.get("/all", protectRoute, getAllPost);
postRouter.post("/create", protectRoute, createPost);
postRouter.post("/like/:id", protectRoute, likeUnlikePost);
postRouter.post("/comment/:id", protectRoute, commentOnPost);
postRouter.post("/update/:id", protectRoute, updatePost);
postRouter.delete("/:id", protectRoute, deletePost);

export default postRouter;
