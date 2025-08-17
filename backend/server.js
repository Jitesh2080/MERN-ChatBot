const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const connectDB = require("./db/connect");
const authRoutes = require("./routes/authRoutes");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

// Connect to the database
connectDB();

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Use the authentication routes
app.use("/api/auth", authRoutes);

const messages = [];

// Apply authentication middleware to the '/chat' namespace
const chatNamespace = io.of("/chat");

chatNamespace.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error("Authentication token required"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Invalid or expired token"));
    }
    socket.user = decoded;
    next();
  });
});

chatNamespace.on("connection", (socket) => {
  console.log("An authenticated user connected:", socket.user.id);
  socket.emit("initial messages", messages);

  socket.on("chat message", async (msg) => {
    console.log("User message received:", msg);

    // Broadcast the user's message to everyone
    chatNamespace.emit("chat message", { text: msg.text, isBot: false });
    messages.push({ text: msg.text, isBot: false });

    // Call the Gemini API
    try {
      const result = await model.generateContent(msg.text);
      const botResponse = result.response.text();

      // Broadcast the bot's response to everyone
      chatNamespace.emit("chat message", { text: botResponse, isBot: true });
      messages.push({ text: botResponse, isBot: true });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage =
        "Sorry, I am unable to generate a response right now.";
      chatNamespace.emit("chat message", { text: errorMessage, isBot: true });
      messages.push({ text: errorMessage, isBot: true });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
