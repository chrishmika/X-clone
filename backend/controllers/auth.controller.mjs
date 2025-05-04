import User from "../models/user.model.mjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.mjs";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "invalid email format need to be more than 6 chars" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "user name already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "user email already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "invalid password format" });
    }
    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

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
    } else {
      return res.status(400).json({ error: "invalid user data" });
    }
  } catch (error) {
    console.log(`error in signup controller ${error.message}`);

    res.status(500).json({ error: "internal server error on signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    const validation = await bcrypt.compare(password, user.password || "");

    if (!validation || !user) {
      return res.status(400).json({ error: "invalid credentials" });
    }
    generateTokenAndSetCookie(user._id, res);

    res.status(201).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
    });
  } catch (error) {
    console.log(`error in login controller ${error.message}`);
    res.status(500).json({ error: "internal server error on login" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "user logout sucessfull" });
  } catch (error) {
    console.log(`error in login controller ${error.message}`);
    res.status(500).json({ error: "internal server error on logout" });
  }
};

export const getme = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log(`error in login controller ${error.message}`);
    res.status(500).json({ error: "internal server error on getme" });
  }
};
