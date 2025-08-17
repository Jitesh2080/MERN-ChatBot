// App.jsx
import React, { useState, useEffect } from "react";
import ChatLogic from "./ChatLogic";
import Login from "../components/Login";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>My MERN Chatbot</h1>
      </header>
      <main>
        {token ? (
          <ChatLogic token={token} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

export default App;
