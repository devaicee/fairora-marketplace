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
              <img src="src/assets/images/icon-1.png" alt="Fairora" />
            </div>
            <span>Fairora</span>
          </div>
          <nav className="nav">
            <a href="#trending-trades">Trades</a>
            <a href="#top-creators">Top Creators</a>
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
                  <img src="src/assets/images/placeholder.jpg" alt="placeholder" />
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
            <h2>Top Creators</h2>
            <p>Checkout Top Rated Creators On The ATN Marketplace</p>
            <button className="btn-secondary">View Startups</button>
          </div>
          
          <div className="creators-grid">
            {[
              { name: "RespitReal", rank: "1st", points: "PHP 100k", avatar: "👩" },
              { name: "DigiLab", rank: "2nd", points: "PHP 85k", avatar: "👨" },
              { name: "GravityOne", rank: "3rd", points: "PHP 75k", avatar: "👨‍💼" },
              { name: "Juanito", rank: "4th", points: "PHP 65k", avatar: "👦" },
              { name: "BlueWhale", rank: "5th", points: "PHP 60k", avatar: "👨‍🎨" },
              { name: "Mr Fox", rank: "6th", points: "PHP 55k", avatar: "👴" },
              { name: "Shroomy", rank: "7th", points: "PHP 50k", avatar: "🧑" },
              { name: "Robotics", rank: "8th", points: "PHP 45k", avatar: "👩‍💻" },
              { name: "RustyRobot", rank: "9th", points: "PHP 40k", avatar: "🤖" },
              { name: "Animakid", rank: "10th", points: "PHP 38k", avatar: "👨‍🎨" },
              { name: "Dotgu", rank: "11th", points: "PHP 35k", avatar: "👩‍🔬" },
              { name: "Ghiblier", rank: "12th", points: "PHP 32k", avatar: "👨‍🚀" }
            ].map((creator, index) => (
              <div key={index} className="creator-card">
                <div className="creator-rank">{index + 1}</div>
                <div className="creator-avatar">{creator.avatar}</div>
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
            <div className="category-card art">
              <div className="category-icon">🎨</div>
              <h3>Art</h3>
            </div>
            <div className="category-card collectibles">
              <div className="category-icon">🖼️</div>
              <h3>Collectibles</h3>
            </div>
            <div className="category-card music">
              <div className="category-icon">🎵</div>
              <h3>Music</h3>
            </div>
            <div className="category-card photography">
              <div className="category-icon">📷</div>
              <h3>Photography</h3>
            </div>
            <div className="category-card video">
              <div className="category-icon">🎬</div>
              <h3>Video</h3>
            </div>
            <div className="category-card utility">
              <div className="category-icon">🔧</div>
              <h3>Utility</h3>
            </div>
            <div className="category-card sport">
              <div className="category-icon">⚽</div>
              <h3>Sport</h3>
            </div>
            <div className="category-card virtual">
              <div className="category-icon">🌍</div>
              <h3>Virtual Worlds</h3>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <p className="section-subtitle">Find Out How To Get Started</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-visual">
                <div className="step-icon">👛</div>
              </div>
              <h3>Setup Your Wallet</h3>
              <p>Set up your digital wallet. Keep your private keys stored securely. Create your favorite cards and list your items for sale.</p>
            </div>
            
            <div className="step-card">
              <div className="step-visual">
                <div className="step-icon">🔍</div>
              </div>
              <h3>Discover & Propose Trades</h3>
              <p>Browse trending trades, search by category, or filter by your interests.</p>
            </div>
            
            <div className="step-card">
              <div className="step-visual">
                <div className="step-icon">🛒</div>
              </div>
              <h3>Complete The Trade</h3>
              <p>Exchange item securely, and experience seamless flow with your trading partners. Trust equals trade to build community trust.</p>
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
