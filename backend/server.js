// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const fs = require("fs"); // Import the file system module
const mime = require("mime-types"); // You may need to install this: npm install mime-types

const connectDB = require("./db/connect");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);

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

// A helper function to format image data for the Gemini API
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

const messages = [];

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
    console.log("Message received:", msg);

    // Broadcast the user's message to everyone
    chatNamespace.emit("chat message", {
      text: msg.text,
      url: msg.url,
      type: msg.type,
      isBot: false,
    });
    messages.push({
      text: msg.text,
      url: msg.url,
      type: msg.type,
      isBot: false,
    });

    try {
      let prompt = "Please analyze this image."; // A basic prompt for the bot
      let generativeParts = [];

      // If the message contains an image, add it to the Gemini API prompt
      if (msg.type === "image") {
        const filePath = `./uploads/${msg.filename}`;
        const mimeType = mime.lookup(filePath);
        generativeParts.push(fileToGenerativePart(filePath, mimeType));
        // You can add more context to the prompt here if needed
      } else {
        prompt = msg.text;
      }

      const result = await model.generateContent([prompt, ...generativeParts]);
      const botResponse = result.response.text();

      // Broadcast the bot's response to everyone
      chatNamespace.emit("chat message", {
        text: botResponse,
        type: "text",
        isBot: true,
      });
      messages.push({ text: botResponse, type: "text", isBot: true });
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage =
        "Sorry, I am unable to generate a response right now.";
      chatNamespace.emit("chat message", {
        text: errorMessage,
        type: "text",
        isBot: true,
      });
      messages.push({ text: errorMessage, type: "text", isBot: true });
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
