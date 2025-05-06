//packages
import { v2 as cloudinary } from "cloudinary";

//models
import Post from "../models/post.model.mjs";
import User from "../models/user.model.mjs";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (!img && !text) {
      return res.status(400).json({ error: "Post must have image or text" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(`error in create post ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "not authorizes to delete" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "post deleted sucessfully" });
  } catch (error) {
    console.log(`error in deletePostController ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const postId = req.params.id;

    if (!text) {
      return res.status(400).json({ error: "text required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();

    res.status(200).json({ message: "comment was added" });
  } catch (error) {
    console.log(`error in create post ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    const userId = req.user._id;
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
      await post.save();
      return res.status(200).json(post);
    }

    post.likes.push(userId);
    await post.save();

    return res.status(200).json(post);
  } catch (error) {
    console.log(`error in create post ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};

export const updatePost = async (req, res) => {
  try {
  } catch (error) {
    console.log(`error in create post ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};
