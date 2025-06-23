//packages
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

//models
import Notification from "../models/notification.model.mjs";
import User from "../models/user.model.mjs";

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

      res.status(200).json({ message: `${userToModify.username} unfollow sucessfully ` });
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

      res.status(200).json({ message: `${userToModify.username} follow sucessfully ` });
    }
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    req.status(500).json({ error: "internal server error on followUnfollowUser" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    //from above it gives 10 users and then o filter existing followers and take first 4 of that filtered values
    const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    res.status(500).json({ error: "internal server error on getSuggestedUsers" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullname, username, email, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    //user need to update password
    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ error: "please provide both current passwoed and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: "current password is incorrect" });
      if (newPassword.length < 6) return res.status(400).json({ error: "password must be longer than 5 charactors" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    //user need to update profile image
    if (profileImg) {
      if (user.profileImg) {
        //sample url => https://res.cloudinary.com/demo/image/upload/sample.jpg and we only care about phrase "sample"
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    await user.save();

    //password should be null when send as a response
    user.password = null;
    return res.status(200).json({ message: "user updated sucessfull" });
  } catch (error) {
    console.log(`error in userController ${error.message}`);
    res.status(500).json({ error: "internal server error on updateUserProfile" });
  }
};
