import Notification from "../models/notification.model.mjs";
import User from "../models/user.model.mjs";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return req.status(404).json({ error: "User not found" });

    res.status(201).json(user);
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    req.status(500).json({ error: "internal server error on getUserProfile" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id); //some other people
    const currentUser = await User.findById(req.user._id); //AKA me

    if (id.toString() === req.user._id.toString()) return res.status(400).json({ error: "you cant follow or unfollow yourself" });

    if (!userToModify || !currentUser) return res.status(400).json({ error: "user not found" });

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "user unfollow sucessfully " });
    } else {
      //follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      //send notification to the user
      const newNotification = new Notification({
        from: req.user._id,
        to: userToModify._id,
        type: "follow",
      });
      await newNotification.save();
      //TODO return the id pf the user as a response

      res.status(200).json({ message: "user follow sucessfully " });
    }
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    req.status(500).json({ error: "internal server error on followUnfollowUser" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    req.status(500).json({ error: "internal server error on getSuggestedUsers" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { fullname, username, email, password, newPassword } = req.body;
    const updatedUser = User.findByIdAndUpdate(req.user._id, {});
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    req.status(500).json({ error: "internal server error on updateUserProfile" });
  }
};
