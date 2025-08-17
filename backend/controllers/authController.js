// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../auth");

// Function to handle user registration (Sign Up)
exports.signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      username,
      password,
    });

    await user.save();
    const token = generateToken(user.id);

    res.status(201).json({ token, message: "User created successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to handle user login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    res.json({ token, message: "Logged in successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to handle user logout
exports.logout = (req, res) => {
  // For JWTs, logout is typically handled on the client side by
  // removing the token. This server-side function can simply
  // provide a confirmation message.
  res.json({ message: "Logout successful" });
};
