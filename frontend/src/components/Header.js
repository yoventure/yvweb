import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ isLoggedIn, handleLogout }) {

  return (
      <header className='header'>
        <nav className='nav'>
          <div className='nav-left'>
            <Link to="/" className="brand">YoVenture</Link>
            <Link to="/chat">DIY</Link>
            <Link to="/planning">Itineraray</Link>
            <Link to="/discuss">Traveler and Supplier</Link>
            <Link to="/profile">Profile</Link>
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
