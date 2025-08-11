import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="App">
      {/* Header */}
<header className="header">
        <div className="container">
          <div className="logo">
            <div className="logo-icon">
              <img src="src/assets/icons/icon-1.png" alt="Fairora" />
            </div>
            <span>Fairora</span>
          </div>
          <nav className="nav">
            <a href="#trending-trades">Trades</a>
            <a href="#top-creators">Top Creators</a>
            <a href="#browse-categories">Categories</a>
            <a href="#discover-more">Discover</a>
            <a href="#how-it-works">How It Works</a>
          </nav>
          <div className="auth-buttons">
            <button className="btn-primary">Sign Up</button>
            <button className="btn-primary-login">Login</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Discover<br/>
                Value-Driven<br/>
                Trading
              </h1>
              <p>Fairora Trading Network Is A Revolutionary Platform Where You Can Trade Virtual Resources, Services, And Knowledge—All Based On The Principle Of Equivalent Value.</p>
              <button className="btn-primary">
                 Get Started
              </button>
              
              <div className="stats">
                <div className="stat">
                  <h3>240k+</h3>
                  <p>Trades Facilitated</p>
                </div>
                <div className="stat">
                  <h3>108k+</h3>
                  <p>Community Size</p>
                </div>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="floating-card digital-assets">
                <div className="card-icon">
                  <img src="src/assets/images/placeholder.jpg" alt="Art" />
                </div>
                <div className="card-content">
                  <h4>Digital Assets</h4>
                  <p>⚡ Activated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Trades */}
      <section className="trending-trades" id="trending-trades">
        <div className="container">
          <h2>Trending Trades</h2>
          <p className="section-subtitle">Checkout Our Weekly Updated Trending Trades.</p>
          
          <div className="trades-grid">
            <div className="trade-card creative">
              <div className="trade-main-visual">
                <img src="src/assets/images/img-1.jpg" alt="Creative Services" />
              </div>
              <div className="trade-thumbnails">
                <div className="thumb-item">
                  <img src="src/assets/images/img-2.jpg" alt="Design" />
                </div>
                <div className="thumb-item">
                  <img src="src/assets/images/img-3.jpg" alt="UI/UX" />
                </div>
                <div className="thumb-count">1025+</div>
              </div>
              <div className="trade-info">
                <h3>Creative Services</h3>
                <div className="creator-info1">
                  <img src="src/assets/icons/ava-6.png" alt="MrFox" className="creator-avatar" />
                  <span>MrFox</span>
                </div>
              </div>
            </div>
            
            <div className="trade-card knowledge">
              <div className="trade-main-visual">
                <img src="src/assets/images/img-4.jpg" alt="Knowledge Exchange" />
              </div>
              <div className="trade-thumbnails">
                <div className="thumb-item">
                  <img src="src/assets/images/img-5.jpg" alt="Coding" />
                </div>
                <div className="thumb-item">
                  <img src="src/assets/images/img-6.jpg" alt="Learning" />
                </div>
                <div className="thumb-count blue">1025+</div>
              </div>
              <div className="trade-info">
                <h3>Knowledge & Skills Exchange</h3>
                <div className="creator-info1">
                  <img src="src/assets/icons/ava-7.png" alt="Shroomie" className="creator-avatar" />
                  <span>Shroomie</span>
                </div>
              </div>
            </div>
            
            <div className="trade-card digital">
              <div className="trade-main-visual">
                <img src="src/assets/images/img-7.jpg" alt="Digital Assets" />
              </div>
              <div className="trade-thumbnails">
                <div className="thumb-item">
                  <img src="src/assets/images/img-8.jpg" alt="NFT" />
                </div>
                <div className="thumb-item">
                  <img src="src/assets/images/img-9.jpg" alt="Digital Art" />
                </div>
                <div className="thumb-count pink">1025+</div>
              </div>
              <div className="trade-info">
                <h3>Digital Assets</h3>
                <div className="creator-info1">
                  <img src="src/assets/icons/ava-8.png" alt="BeKind2Robots" className="creator-avatar" />
                  <span>BeKind2Robots</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Creators */}
      <section className="top-creators" id="top-creators">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Top Creators</h2>
              <p>Checkout Top Rated Creators On The ATN Marketplace</p>
            </div>
            <button className="btn-secondary">View Startups</button>
          </div>
          
          <div className="creators-grid">
            {[
              { name: "RespitReal", points: "PHP 100k", avatar: "ava-1.png" },
              { name: "DigiLab", points: "PHP 85k", avatar: "ava-2.png" },
              { name: "GravityOne", points: "PHP 75k", avatar: "ava-3.png" },
              { name: "Juanito", points: "PHP 65k", avatar: "ava-4.png" },
              { name: "BlueWhale", points: "PHP 60k", avatar: "ava-5.png" },
              { name: "Mr Fox", points: "PHP 55k", avatar: "ava-6.png" },
              { name: "Shroomy", points: "PHP 50k", avatar: "ava-7.png" },
              { name: "Robotics", points: "PHP 45k", avatar: "ava-8.png" },
              { name: "RustyRobot", points: "PHP 40k", avatar: "ava-9.png" },
              { name: "Animakid", points: "PHP 38k", avatar: "ava-10.png" },
              { name: "Dotgu", points: "PHP 35k", avatar: "ava-11.png" },
              { name: "Ghiblier", points: "PHP 32k", avatar: "ava-12.png" }
            ].map((creator, index) => (
              <div key={index} className="creator-card">
                <div className="creator-rank">{index + 1}</div>
                <div className="creator-avatar">
                  <img src={`src/assets/icons/${creator.avatar}`} alt={creator.name} />
                </div>
                <div className="creator-info">
                  <h4>{creator.name}</h4>
                  <p className="creator-stats">Total Sales: {creator.points}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Browse Categories */}
      <section className="browse-categories" id="browse-categories">
        <div className="container">
          <h2>Browse Categories</h2>
          
          <div className="categories-grid">
            {[
              { name: "Creative Assets", image: "src/assets/images/cat-1.png" },
              { name: "Audio & Music", image: "src/assets/images/cat-2.png" },
              { name: "Video & Animation", image: "src/assets/images/cat-3.png" },
              { name: "Design & Code", image: "src/assets/images/cat-4.png" },
              { name: "eBooks & Documents", image: "src/assets/images/cat-5.png" },
              { name: "Educational Materials", image: "src/assets/images/cat-6.png" },
              { name: "Printable Designs", image: "src/assets/images/cat-7.png" },
            ].map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-icon">
                  <img src={category.image} alt={category.name} />
                </div>
                <h3>{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover More */}
      <section className="discover-more" id="discover-more">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Discover More</h2>
              <p>Find Out How To Get Started</p>
            </div>
            <button className="btn-secondary">View All</button>
          </div>
          
          <div className="discover-grid">
            {[
              {
                title: "Tech Resources",
                creator: "Animakid",
                image: "src/assets/images/dc1.png"
              },
              {
                title: "Learning Materials",
                creator: "Juanito", 
                image: "src/assets/images/dc2.png"
              },
              {
                title: "Printables",
                creator: "Dotgu",
                image: "src/assets/images/dc3.png"
              }
            ].map((item, index) => (
              <div key={index} className="discover-card">
                <div className="discover-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="discover-info">
                  <h4>{item.title}</h4>
                  <div className="discover-creator">
                    <img src="/api/placeholder/24/24" alt={item.creator} />
                    <span>{item.creator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <p className="section-subtitle">Find Out How To Get Started</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-visual">
                <div className="step-icon-wrapper">
                  <div className="step-icon">
                    <img src="src/assets/icons/hw1.png" alt="Setup Wallet" />
                  </div>
                  <div className="decorative-elements">
                    <span className="deco-1">✦</span>
                    <span className="deco-2">◦</span>
                    <span className="deco-3">▽</span>
                    <span className="deco-4">◦</span>
                    <span className="deco-5">✦</span>
                    <span className="deco-6">◦</span>
                  </div>
                </div>
              </div>
              <h3>Setup Your Wallet</h3>
              <p>Securely connect your Fairora wallet to store digital assets, manage trade items, and track your token-based transactions.</p>
            </div>
            
            <div className="step-card">
              <div className="step-visual">
                <div className="step-icon-wrapper">
                  <div className="step-icon">
                    <img src="src/assets/icons/hw2.png" alt="Discover Trades" />
                  </div>
                  <div className="decorative-elements">
                    <span className="deco-1">✦</span>
                    <span className="deco-2">◦</span>
                    <span className="deco-3">▽</span>
                    <span className="deco-4">◦</span>
                    <span className="deco-5">✦</span>
                    <span className="deco-6">◦</span>
                  </div>
                </div>
              </div>
              <h3>Discover & Propose Trades</h3>
              <p>Browse trending trades, search by category, or filter by your interests.</p>
            </div>
            
            <div className="step-card">
              <div className="step-visual">
                <div className="step-icon-wrapper">
                  <div className="step-icon">
                    <img src="src/assets/icons/hw3.png" alt="Complete Trade" />
                  </div>
                  <div className="decorative-elements">
                    <span className="deco-1">✦</span>
                    <span className="deco-2">◦</span>
                    <span className="deco-3">▽</span>
                    <span className="deco-4">◦</span>
                    <span className="deco-5">✦</span>
                    <span className="deco-6">◦</span>
                  </div>
                </div>
              </div>
              <h3>Complete The Trade</h3>
              <p>Confirm the trade terms, exchange items securely, and track completion through your wallet. Both parties can rate the trade to build community trust.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <div className="newsletter-visual">
              <div className="newsletter-icon">📧</div>
            </div>
            <div className="newsletter-text">
              <h2>Stay In The Loop With Fairora</h2>
              <p>Get The Latest Trade Opportunities, Updates, And Exclusive Insights Delivered Straight To Your Inbox.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email here" />
                <button className="btn-primary">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
              <img src="src/assets/icons/icon-1.png" alt="Fairora" />
            </div>
                <span>Fairora</span>
              </div>
              <p>A Revolutionary Platform for Fair and Transparent Trades</p>
              <p>Join our Community</p>
            </div>
            
            <div className="footer-section">
              <h4>Explore</h4>
              <ul>
                <li><a href="#">Marketplace</a></li>
                <li><a href="#">Rankings</a></li>
                <li><a href="#">Top Trades</a></li>
                <li><a href="#">Connect a wallet</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Join Our Weekly Digest</h4>
              <p>Get exclusive promotions & updates straight to your inbox.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email here" />
                <button className="btn-primary">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
