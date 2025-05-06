import express from "express";
import { protectRoute } from "../middleware/protectRoute.mjs";
import { commentOnPost, createPost, deletePost, likeUnlikePost, updatePost } from "../controllers/post.controller.mjs";

const postRouter = express.Router();

postRouter.post("/create", protectRoute, createPost);
postRouter.post("/like/:id", protectRoute, likeUnlikePost);
postRouter.post("/comment/:id", protectRoute, commentOnPost);
// postRouter.post("/update", protectRoute, updatePost);
postRouter.delete("/:id", protectRoute, deletePost);

export default postRouter;
