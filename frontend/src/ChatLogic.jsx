// ChatLogic.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Chat from "./Chat";

const SOCKET_SERVER_URL = "http://localhost:5001/chat";

const ChatLogic = ({ token, onLogout }) => {
  // The token prop is received here
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    // The token is used here to create the authenticated socket connection
    // here the clients first makes a connection request to the server and while making this connection request it has also passed the jwt token
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
      socket.emit("chat message", { text: message, isBot: false });
      setMessage("");
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
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
      onLogout={onLogout}
    />
  );
};

export default ChatLogic;
