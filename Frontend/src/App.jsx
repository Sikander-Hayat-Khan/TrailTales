import React, { useState, useEffect } from 'react';
import './App.css';

// Import images - replace these with your actual image paths
import bookImage from './assets/book.png';
import nature1 from './assets/nature.jpg';
import nature2 from './assets/nature1.jpg';
import nature3 from './assets/nature2.jpg';

function App() {
  const [animatedText, setAnimatedText] = useState([]);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const originalText = 'TrailTales';

  // Button press animation
  const buttonPress = (event) => {
    const button = event.currentTarget;
    button.style.boxShadow = "0px 0px 0px 0px black";
    button.style.transition = "box-shadow 0.2s ease-in-out";
    setTimeout(() => {
      button.style.boxShadow = "1px 4px 10px 0px black";
    }, 200);
  };

  // Hamburger menu toggle
  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  // Letter by letter animation
  useEffect(() => {
    const animateText = () => {
      const spans = originalText.split('').map((letter, idx) => (
        <span 
          key={`${idx}-${Date.now()}`}
          style={{ animationDelay: `${idx * 0.4}s` }}
        >
          {letter}
        </span>
      ));
      
      setAnimatedText(spans);
      
      const totalTime = (originalText.length * 500) + 900;
      setTimeout(animateText, totalTime);
    };
    
    animateText();
  }, [originalText]);

  return (
    <div className={`App ${isMenuActive ? 'menu-active' : ''}`}>
      {/* Hamburger Menu */}
      <div 
        className={`hamburger ${isMenuActive ? 'active' : ''}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Header */}
      <header className={isMenuActive ? 'active' : ''}>
        <div className="container">
          <h1 id="logo">
            <span className="full-text">TrailTales</span>
            <span className="short-text">TT</span>
          </h1>
          <nav>
            <ul>
              <li>Home</li>
              <li>Services</li>
              <li>Contact Us</li>
            </ul>
            <div className="buttons">
              <button className="login" onClick={buttonPress}>Login</button>
              <button className="signup" onClick={buttonPress}>Sign Up</button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Section */}
      <section className="main">
        <div className="container">
          <img src={bookImage} alt="book" className="book" />
          <span className="welcome-text">
            <h1>Welcome to</h1>
            <h1 id="letterbyletter">{animatedText}</h1>
          </span>
          <p>
            Every journey has a story — map yours with TrailTales. Capture your
            adventures where they happened. Your memories deserve a place on the
            map. Because every trail tells a tale worth remembering.
          </p>
          <button className="explore" onClick={buttonPress}>Explore More</button>

          <div className="images">
            <img width="40%" src={nature1} alt="nature" />
            <img width="40%" src={nature2} alt="nature" />
            <img width="40%" src={nature3} alt="nature" />
          </div>
        </div>
      </section>

      <hr />

      {/* Services Section */}
      <section className="services">
        
      </section>

      <hr />

      {/* Contact Us Section */}
      <section className="contact-us">

      </section>
    </div>
  );
}

export default App;