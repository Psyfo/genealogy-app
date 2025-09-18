'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavigationProps {
  currentPage?: string;
}

export default function Navigation({ currentPage = 'tree' }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'tree',
      label: 'Family Tree',
      description: 'Visualize your family connections',
      icon: '🌳',
      href: '/',
      available: true
    },
    {
      id: 'people',
      label: 'People',
      description: 'Manage family members',
      icon: '👥',
      href: '/people',
      available: true
    },
    {
      id: 'stories',
      label: 'Stories',
      description: 'Family narratives and memories',
      icon: '📖',
      href: '/stories',
      available: false
    },
    {
      id: 'photos',
      label: 'Photos',
      description: 'Family photo collections',
      icon: '📸',
      href: '/photos',
      available: false
    },
    {
      id: 'documents',
      label: 'Documents',
      description: 'Birth certificates, records',
      icon: '📄',
      href: '/documents',
      available: false
    },
    {
      id: 'timeline',
      label: 'Timeline',
      description: 'Family history timeline',
      icon: '⏰',
      href: '/timeline',
      available: false
    },
    {
      id: 'search',
      label: 'Search',
      description: 'Find family members',
      icon: '🔍',
      href: '/search',
      available: false
    },
    {
      id: 'reports',
      label: 'Reports',
      description: 'Generate family reports',
      icon: '📊',
      href: '/reports',
      available: false
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'App preferences',
      icon: '⚙️',
      href: '/settings',
      available: true
    }
  ];

  const availableItems = navigationItems.filter(item => item.available);
  const comingSoonItems = navigationItems.filter(item => !item.available);

  return (
    <nav className="navigation">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Navigation Content */}
      <div className={`navigation-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo and App Title */}
        <div className="nav-header">
          <div className="nav-logo">
            <span className="logo-icon">🌳</span>
            <div className="logo-text">
              <h2 className="app-name">Family Tree</h2>
              <p className="app-tagline">Discover Your Heritage</p>
            </div>
          </div>
        </div>

        {/* Available Features */}
        <div className="nav-section">
          <h3 className="section-title">Available Features</h3>
          <ul className="nav-list">
            {availableItems.map((item) => (
              <li key={item.id} className="nav-item">
                <Link
                  href={item.href}
                  className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <div className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Coming Soon Features */}
        <div className="nav-section">
          <h3 className="section-title">Coming Soon</h3>
          <ul className="nav-list">
            {comingSoonItems.map((item) => (
              <li key={item.id} className="nav-item coming-soon">
                <div className="nav-link disabled">
                  <span className="nav-icon">{item.icon}</span>
                  <div className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                  <span className="coming-soon-badge">Soon</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* User Profile Section */}
        <div className="nav-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="user-info">
              <span className="user-name">Family Researcher</span>
              <span className="user-status">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <style jsx>{`
        .navigation {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: linear-gradient(180deg, #a5c6d5 0%, #f8e8b4 100%);
          border-right: 2px solid #d6ba5c;
          z-index: 1000;
          transition: transform 0.3s ease;
          overflow-y: auto;
        }

        .mobile-menu-button {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 1001;
          background: #a65e3a;
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          cursor: pointer;
          flex-direction: column;
          gap: 4px;
        }

        .hamburger-line {
          width: 24px;
          height: 3px;
          background: #f8e8b4;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .navigation-content {
          padding: 2rem 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .nav-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(166, 94, 58, 0.2);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          font-size: 2rem;
          filter: drop-shadow(0 2px 4px rgba(166, 94, 58, 0.2));
        }

        .app-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #a65e3a;
          margin: 0;
        }

        .app-tagline {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #a65e3a;
          opacity: 0.8;
          margin: 0;
        }

        .nav-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.125rem;
          font-weight: 500;
          color: #a65e3a;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-item {
          margin-bottom: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          cursor: pointer;
        }

        .nav-link:not(.disabled):hover {
          background: rgba(166, 94, 58, 0.1);
          transform: translateX(4px);
        }

        .nav-link.active {
          background: #d6ba5c;
          color: #a65e3a;
          font-weight: 500;
        }

        .nav-link.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .nav-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
        }

        .nav-text {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .nav-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #a65e3a;
        }

        .nav-description {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #a65e3a;
          opacity: 0.7;
        }

        .coming-soon-badge {
          background: #f1b3a2;
          color: #a65e3a;
          font-size: 0.625rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-footer {
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(166, 94, 58, 0.2);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: #a65e3a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-icon {
          font-size: 1.25rem;
          color: #f8e8b4;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #a65e3a;
        }

        .user-status {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #a65e3a;
          opacity: 0.7;
        }

        /* Mobile Styles */
        @media (max-width: 1024px) {
          .navigation {
            transform: translateX(-100%);
          }

          .mobile-menu-button {
            display: flex;
          }

          .navigation.mobile-open {
            transform: translateX(0);
          }

          .navigation-content.mobile-open {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .navigation {
            width: 100vw;
            max-width: 320px;
          }

          .navigation-content {
            padding: 1.5rem 1rem;
          }
        }

        /* Mobile Overlay */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
      `}</style>
    </nav>
  );
}
