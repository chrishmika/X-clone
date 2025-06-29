//packages
import { v2 as cloudinary } from "cloudinary";

//models
import Post from "../models/post.model.mjs";
import User from "../models/user.model.mjs";
import Notification from "../models/notification.model.mjs";

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

    const notification = new Notification({
      to: post.user,
      from: userId,
      type: "comment",
    });
    await notification.save();

    res.status(200).json(post);
  } catch (error) {
    console.log(`error in create post ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      //unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
      res.status(200).json({ message: "post unliked sucessfull" });
    } else {
      //like post
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });

      await notification.save();

      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log(`error in like/unlike post ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { text } = req.body;
    let post = await Post.findById(req.params.id);

    if (!text) {
      return res.status(404).json({ error: "comment is empty" });
    }

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    post.text = text;
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.log(`error in create post ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log(`error in getAllPost ${error.message}`);
    res.status(500).json({ error: "internl server error on postController" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    //const userId = req.user._id; //actually params are not needed
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    // const likedPosts = await User.findById(userId).populate("likedPosts").select("likedPosts");
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (!likedPosts) {
      return res.status(404).json({ message: "no liked posts" });
    }

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("error in getLikedPosts ", error.message);
    return res.status(500).json({ error: "internal server error on postController" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("error in getLikedPosts ", error.message);
    return res.status(500).json({ error: "internal server error on postController" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.find({ username }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "no user found" });
    }

    const userPosts = await Post.find({ user })
      .sort({ createdAt: -1 })
      .populate({
        path: "likes",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (!userPosts) {
      return res.status(404).json({ message: "no post found with followers" });
    }

    res.status(200).json(userPosts);
  } catch (error) {
    console.log("error in getUserPosts ", error.message);
    return res.status(500).json({ error: `internal server error on postController` });
  }
};
