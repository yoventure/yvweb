import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ isLoggedIn, handleLogout }) {

  return (
      <header className='header'>
      <nav className='nav'>
        <div className='nav-left'>
          <Link to="/" className="brand">YoVenture</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/planning">Planning</Link>
        </div>
        <div className='nav-right'>
        {isLoggedIn ? (
          <Link to="/" onClick={handleLogout} className="button">Sign Out</Link>
        ) : (
          <>
            <Link to="/login" className="button">Login</Link>
            <Link to="/signup" className="button">Signup</Link>
          </>
        )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
