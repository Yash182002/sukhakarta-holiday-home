"use client";

import { useState } from 'react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('story');

  const stats = [
    { icon: '⭐', value: '500+', label: 'Happy Guests' },
    { icon: '🏆', value: '4.8/5', label: 'Rating' },
    { icon: '🏨', value: '10+', label: 'Premium Rooms' },
    { icon: '📅', value: '5+', label: 'Years Experience' }
  ];

  const team = [
    { name: 'Rajesh Kumar', role: 'Founder & Owner', icon: '👨‍💼' },
    { name: 'Priya Sharma', role: 'Guest Relations Manager', icon: '👩‍💼' },
    { name: 'Chef Arjun', role: 'Head Chef', icon: '👨‍🍳' },
    { name: 'Maya Patel', role: 'Hospitality Manager', icon: '👩‍🏫' }
  ];

  const values = [
    {
      icon: '🤝',
      title: 'Hospitality',
      description: 'We treat every guest as family, ensuring personalized care and attention.'
    },
    {
      icon: '🌟',
      title: 'Excellence',
      description: 'Committed to delivering the highest standards in service and comfort.'
    },
    {
      icon: '🌊',
      title: 'Sustainability',
      description: 'Eco-friendly practices to preserve the natural beauty of Alibag.'
    },
    {
      icon: '💎',
      title: 'Authenticity',
      description: 'Genuine coastal experiences with local culture and traditions.'
    }
  ];

  return (
    <div className="about-page">
      {/* Animated Particles Background */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Our Story</h1>
          <p>Creating Unforgettable Memories Since 2019</p>
          <div className="scroll-indicator">
            <div className="mouse">
              <div className="wheel"></div>
            </div>
            <span>Scroll to explore</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'story' ? 'active' : ''}`}
            onClick={() => setActiveTab('story')}
          >
            Our Story
          </button>
          <button
            className={`tab ${activeTab === 'vision' ? 'active' : ''}`}
            onClick={() => setActiveTab('vision')}
          >
            Vision & Mission
          </button>
          <button
            className={`tab ${activeTab === 'values' ? 'active' : ''}`}
            onClick={() => setActiveTab('values')}
          >
            Our Values
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'story' && (
            <div className="content-panel">
              <div className="content-grid">
                <div className="content-text">
                  <h2>Welcome to Sukhakarta Holiday Home</h2>
                  <p>
                    Nestled along the pristine coastline of Alibag, Sukhakarta Holiday Home was born from a simple dream – to create a sanctuary where the chaos of city life melts away, replaced by the gentle rhythm of ocean waves and warm coastal hospitality.
                  </p>
                  <p>
                    Founded in 2019 by the Kumar family, we've transformed a beachside property into a beloved destination that feels like a home away from home. Every corner of Sukhakarta has been designed with love, attention to detail, and a deep respect for the natural beauty that surrounds us.
                  </p>
                  <p>
                    What started as a small family venture has blossomed into a thriving hospitality experience, hosting thousands of guests from across India and beyond. Yet, we've never lost sight of our core values – personalized care, authentic experiences, and creating memories that last a lifetime.
                  </p>
                  <div className="highlight-box">
                    <h3>🌟 Our Promise</h3>
                    <p>Every guest is treated like family. We're not just offering rooms; we're sharing a piece of paradise.</p>
                  </div>
                </div>
                <div className="content-visual">
                  <div className="visual-card">
                    <div className="visual-icon">🏖️</div>
                    <h3>Prime Location</h3>
                    <p>Minutes from Alibag's most beautiful beaches</p>
                  </div>
                  <div className="visual-card">
                    <div className="visual-icon">🏡</div>
                    <h3>Comfort & Luxury</h3>
                    <p>Modern amenities in a serene setting</p>
                  </div>
                  <div className="visual-card">
                    <div className="visual-icon">🍴</div>
                    <h3>Culinary Excellence</h3>
                    <p>Authentic local and international cuisine</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vision' && (
            <div className="content-panel">
              <div className="vision-grid">
                <div className="vision-card">
                  <h3>🎯 Our Vision</h3>
                  <p>
                    To be Alibag's most loved hospitality destination, where every guest discovers the perfect blend of luxury, comfort, and authentic coastal experiences. We envision a future where Sukhakarta becomes synonymous with unforgettable seaside getaways.
                  </p>
                </div>
                <div className="vision-card">
                  <h3>🚀 Our Mission</h3>
                  <p>
                    To provide exceptional hospitality that exceeds expectations, preserve and celebrate local culture, operate sustainably to protect our environment, and create a workplace where our team thrives and grows.
                  </p>
                </div>
              </div>
              <div className="timeline">
                <h3>Our Journey</h3>
                <div className="timeline-item">
                  <div className="timeline-year">2019</div>
                  <div className="timeline-content">
                    <h4>The Beginning</h4>
                    <p>Sukhakarta Holiday Home opens its doors to first guests</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2020</div>
                  <div className="timeline-content">
                    <h4>Expansion</h4>
                    <p>Added premium sea-view rooms and enhanced amenities</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2022</div>
                  <div className="timeline-content">
                    <h4>Recognition</h4>
                    <p>Awarded 'Best Beach Stay in Alibag' by Travel India Magazine</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-year">2024</div>
                  <div className="timeline-content">
                    <h4>Digital Innovation</h4>
                    <p>Launched digital menu and online booking platform</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="content-panel">
              <h2 className="section-title">What We Stand For</h2>
              <div className="values-grid">
                {values.map((value, idx) => (
                  <div key={idx} className="value-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="value-icon">{value.icon}</div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Team Section */}
        <div className="team-section">
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-subtitle">The people who make your stay exceptional</p>
          <div className="team-grid">
            {team.map((member, idx) => (
              <div key={idx} className="team-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="team-avatar">{member.icon}</div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2>Experience Sukhakarta</h2>
          <p>Join our family of happy guests and create your own unforgettable memories</p>
          <div className="cta-buttons">
            <a href="/book" className="cta-btn primary">Book Your Stay</a>
            <a href="/contact" className="cta-btn secondary">Contact Us</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .scroll-indicator {
  animation: fadeOut 2s ease-in-out forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
    visibility: visible;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
}


        .particles {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #f97316;
          border-radius: 50%;
          animation: rise linear infinite;
        }

        @keyframes rise {
          0% {
            bottom: -10px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            bottom: 100vh;
            opacity: 0;
          }
        }

        .hero {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.2), transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(14, 165, 233, 0.2), transparent 50%);
          animation: pulse 10s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2rem;
        }

        .hero h1 {
          font-size: clamp(4rem, 10vw, 7rem);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff 0%, #f97316 50%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInUp 1s ease-out;
        }

        .hero p {
          font-size: clamp(1.2rem, 3vw, 2rem);
          color: #cbd5e1;
          animation: fadeInUp 1s ease-out 0.3s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scroll-indicator {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          animation: fadeIn 1s ease-out 1s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .mouse {
          width: 30px;
          height: 50px;
          border: 2px solid #f97316;
          border-radius: 20px;
          position: relative;
        }

        .wheel {
          width: 4px;
          height: 10px;
          background: #f97316;
          border-radius: 2px;
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          animation: scroll 2s ease-in-out infinite;
        }

        @keyframes scroll {
          0% { top: 8px; opacity: 1; }
          100% { top: 30px; opacity: 0; }
        }

        .scroll-indicator span {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        .stats-section {
          position: relative;
          z-index: 1;
          padding: 4rem 2rem;
          margin-top: -5rem;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 4rem;
          position: relative;
          z-index: 1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .stat-card {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          transition: all 0.4s;
          animation: slideUp 0.6s ease-out both;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 20px 50px rgba(249, 115, 22, 0.3);
        }

        .stat-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #f97316;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #cbd5e1;
          font-size: 1.1rem;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin: 4rem 0 2rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .tab {
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(249, 115, 22, 0.2);
          border-radius: 50px;
          color: #f8fafc;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab:hover {
          background: rgba(249, 115, 22, 0.1);
          border-color: #f97316;
        }

        .tab.active {
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-color: #f97316;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .tab-content {
          margin-bottom: 4rem;
        }

        .content-panel {
          animation: fadeInUp 0.6s ease-out;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .content-text h2 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .content-text p {
          line-height: 1.8;
          color: #cbd5e1;
          margin-bottom: 1.5rem;
        }

        .highlight-box {
          margin-top: 2rem;
          padding: 2rem;
          background: rgba(249, 115, 22, 0.1);
          border-left: 4px solid #f97316;
          border-radius: 12px;
        }

        .highlight-box h3 {
          color: #f97316;
          margin-bottom: 1rem;
        }

        .content-visual {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .visual-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
          transition: all 0.3s;
        }

        .visual-card:hover {
          transform: translateX(10px);
          border-color: #f97316;
        }

        .visual-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .visual-card h3 {
          color: #f97316;
          margin-bottom: 0.5rem;
        }

        .visual-card p {
          color: #94a3b8;
        }

        .vision-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .vision-card {
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
        }

        .vision-card h3 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #f97316;
        }

        .vision-card p {
          line-height: 1.8;
          color: #cbd5e1;
        }

        .timeline {
          margin-top: 3rem;
        }

        .timeline h3 {
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          color: #f97316;
        }

        .timeline-item {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
          position: relative;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: 75px;
          top: 40px;
          bottom: -40px;
          width: 2px;
          background: linear-gradient(to bottom, #f97316, transparent);
        }

        .timeline-item:last-child::before {
          display: none;
        }

        .timeline-year {
          text-align: right;
          font-size: 2rem;
          font-weight: 700;
          color: #f97316;
          padding-right: 2rem;
        }

        .timeline-content {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 16px;
        }

        .timeline-content h4 {
          color: #f97316;
          margin-bottom: 0.5rem;
        }

        .timeline-content p {
          color: #cbd5e1;
        }

        .section-title {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          text-align: center;
          color: #94a3b8;
          margin-bottom: 3rem;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .value-card {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          text-align: center;
          transition: all 0.4s;
          animation: fadeIn 0.6s ease-out both;
        }

        .value-card:hover {
          transform: translateY(-10px);
          border-color: #f97316;
          box-shadow: 0 20px 50px rgba(249, 115, 22, 0.3);
        }

        .value-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }

        .value-card h3 {
          color: #f97316;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .value-card p {
          color: #cbd5e1;
          line-height: 1.6;
        }

        .team-section {
          margin: 5rem 0;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .team-card {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 20px;
          transition: all 0.4s;
          animation: slideUp 0.6s ease-out both;
        }

        .team-card:hover {
          transform: scale(1.05);
          border-color: #f97316;
          box-shadow: 0 20px 50px rgba(249, 115, 22, 0.3);
        }

        .team-avatar {
          width: 100px;
          height: 100px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(14, 165, 233, 0.2));
          border: 2px solid #f97316;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }

        .team-card h3 {
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }

        .team-card p {
          color: #94a3b8;
        }

        .cta-section {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          border-radius: 30px;
          margin: 5rem 0;
        }

        .cta-section h2 {
          font-size: 3rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cta-section p {
          font-size: 1.2rem;
          color: #cbd5e1;
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          padding: 1.2rem 3rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          display: inline-block;
        }

        .cta-btn.primary {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
        }

        .cta-btn.primary:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(249, 115, 22, 0.6);
        }

        .cta-btn.secondary {
          background: transparent;
          color: #f97316;
          border: 2px solid #f97316;
        }

        .cta-btn.secondary:hover {
          background: rgba(249, 115, 22, 0.1);
          transform: translateY(-5px);
        }

        @media (max-width: 968px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .vision-grid {
            grid-template-columns: 1fr;
          }

          .timeline-item {
            grid-template-columns: 1fr;
          }

          .timeline-year {
            text-align: left;
            padding-right: 0;
            padding-bottom: 0.5rem;
          }

          .timeline-item::before {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
