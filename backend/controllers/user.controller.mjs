import User from "../models/user.model.mjs";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return req.status(404).json({ error: "User not found" });
    }

    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      username: newUser.username,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
      bio: newUser.bio,
      link: newUser.link,
    });
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    req.status(500).json({ error: "internal server error on getUserProfile" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    req.status(500).json({ error: "internal server error on followUnfollowUser" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    req.status(500).json({ error: "internal server error on updateUserProfile" });
  }
};
