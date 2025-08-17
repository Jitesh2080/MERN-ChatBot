// Chat.jsx
import React from "react";
import "./App.css";

const Chat = ({
  messages,
  message,
  handleSendMessage,
  handleMessageChange,
  onLogout,
}) => {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-bubble ${msg.isBot ? "bot" : "user"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
