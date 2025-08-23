// ChatLogic.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Chat from "./Chat";

const SOCKET_SERVER_URL = "http://localhost:5001/chat";

const ChatLogic = ({ token, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { token },
    });
    setSocket(newSocket);

    newSocket.on("initial messages", (initialMessages) => {
      setMessages(initialMessages);
    });

    newSocket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      socket.emit("chat message", { text: message, type: "text" });
      setMessage("");
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        // Send a message to the chat with the image URL and filename
        socket.emit("chat message", {
          text: "Image uploaded",
          url: data.url,
          filename: data.filename, // Add the filename here
          type: "image",
        });
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  if (!token) {
    return <div>Authenticating...</div>;
  }

  return (
    <Chat
      messages={messages}
      message={message}
      handleSendMessage={handleSendMessage}
      handleMessageChange={handleMessageChange}
      handleImageUpload={handleImageUpload}
      onLogout={onLogout}
    />
  );
};

export default ChatLogic;
