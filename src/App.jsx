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
          <button className="btn-primary">Sign Up</button>
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
              <button className="btn-get-started">
                <span>⚡</span> Get Started
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
      <section className="trending-trades">
        <div className="container">
          <h2>Trending Trades</h2>
          <p className="section-subtitle">Checkout Our Weekly Updated Trending Trades.</p>
          
          <div className="trades-grid">
            <div className="trade-card creative">
              <div className="trade-visual">
                <div className="trade-icon">💻</div>
              </div>
              <div className="trade-info">
                <div className="trade-badge">PHP</div>
                <h3>Creative Services</h3>
                <p>⚡ 87pts</p>
              </div>
            </div>
            
            <div className="trade-card knowledge">
              <div className="trade-visual">
                <div className="trade-icon">📚</div>
              </div>
              <div className="trade-info">
                <div className="trade-badge blue">1028+</div>
                <h3>Knowledge & Skills Exchange</h3>
                <p>⚡ Beginner</p>
              </div>
            </div>
            
            <div className="trade-card digital">
              <div className="trade-visual">
                <div className="trade-icon">🎯</div>
              </div>
              <div className="trade-info">
                <div className="trade-badge pink">1968+</div>
                <h3>Digital Assets</h3>
                <p>⚡ SecureObject</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Creators */}
      <section className="top-creators">
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
      <section className="browse-categories">
        <div className="container">
          <h2>Browse Categories</h2>
          
          <div className="categories-grid">
            {[
              { name: "Creative Assets", image: "src/assets/images/cat-1.png" },
              { name: "Audio & Music", image: "src/assets/images/cat-2.png" },
              { name: "Video & Animation", image: "src/assets/images/cat-3.png" },
              { name: "Software & Code", image: "src/assets/images/cat-4.png" },
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
      <section className="discover-more">
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
                title: "Distant Galaxy",
                creator: "MoonDancer",
                price: "1.63 ETH",
                likes: "196",
                image: "/api/placeholder/300/200"
              },
              {
                title: "Life On Edena",
                creator: "NebulaKid", 
                price: "1.63 ETH",
                likes: "196",
                image: "/api/placeholder/300/200"
              },
              {
                title: "AstroFiction",
                creator: "Spaceone",
                price: "1.63 ETH", 
                likes: "196",
                image: "/api/placeholder/300/200"
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
                  <div className="discover-price">
                    <span>Price</span>
                    <strong>{item.price}</strong>
                  </div>
                  <div className="discover-likes">
                    <span>Highest Bid</span>
                    <strong>{item.likes} wETH</strong>
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
                    <img src="/api/placeholder/120/120" alt="Setup Wallet" />
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
                    <img src="/api/placeholder/120/120" alt="Discover Trades" />
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
                    <img src="/api/placeholder/120/120" alt="Complete Trade" />
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
                <div className="logo-icon">⚡</div>
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
