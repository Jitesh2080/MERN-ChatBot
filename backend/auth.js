// auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables from .env file

// A secret key for signing and verifying the JWT token
const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
};

// Middleware to verify the JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  generateToken,
  authenticateToken,
};
