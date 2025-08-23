// Chat.jsx
import React from "react";
import "./App.css";

const Chat = ({
  messages,
  message,
  handleSendMessage,
  handleMessageChange,
  handleImageUpload, // New prop
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
            {msg.type === "image" ? (
              <img
                src={msg.url}
                alt="Uploaded"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            ) : (
              msg.text
            )}
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
        {/* Hidden file input */}
        <input
          type="file"
          id="file-upload"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        {/* Label acts as a button to trigger the hidden input */}
        <label htmlFor="file-upload" className="file-upload-label">
          📁
        </label>
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
