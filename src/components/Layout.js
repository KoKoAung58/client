// src/components/Layout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const logout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">LOGO</div>
        <nav className="nav">
          <a href="/chat-history">Chat History</a>
          <a href="/profile">Profile</a>
          <a href="/settings">Settings</a>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>

      <main>
        {children}
      </main>

      <footer className="footer">
        <div className="logo">LOGO</div>
        <nav className="nav">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/contact">Contact</a>
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
