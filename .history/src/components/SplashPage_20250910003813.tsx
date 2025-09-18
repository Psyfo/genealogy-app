"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SplashPageProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export default function SplashPage({ onComplete, minDisplayTime = 3000 }: SplashPageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // Ensure minimum display time
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out to complete
    }, minDisplayTime);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete, minDisplayTime]);

  if (!isVisible) return null;

  return (
    <div className="splash-container">
      <div className="splash-content">
        {/* Logo */}
        <div className="logo-container">
          <Image
            src="/logo-full.png"
            alt="Family Tree"
            width={200}
            height={80}
            priority
            className="logo-image"
          />
        </div>

        {/* App Title */}
        <h1 className="app-title">Family Tree</h1>
        <p className="app-subtitle">Discover Your Heritage</p>

        {/* Loading Indicator */}
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(loadingProgress, 100)}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {Math.round(Math.min(loadingProgress, 100))}%
            </span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="decorative-elements">
          <div className="decorative-circle circle-1"></div>
          <div className="decorative-circle circle-2"></div>
          <div className="decorative-circle circle-3"></div>
        </div>
      </div>

      <style jsx>{`
        .splash-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #a5c6d5 0%, #f8e8b4 50%, #f1b3a2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.5s ease-in-out;
        }

        .splash-content {
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .logo-container {
          margin-bottom: 2rem;
          animation: slideInDown 0.8s ease-out;
        }

        .logo-image {
          filter: drop-shadow(0 4px 8px rgba(166, 94, 58, 0.2));
        }

        .app-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 600;
          color: #a65e3a;
          margin: 0 0 0.5rem 0;
          animation: slideInUp 0.8s ease-out 0.2s both;
          text-shadow: 0 2px 4px rgba(166, 94, 58, 0.1);
        }

        .app-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 1.125rem;
          color: #a65e3a;
          opacity: 0.8;
          margin: 0 0 3rem 0;
          animation: slideInUp 0.8s ease-out 0.4s both;
        }

        .loading-container {
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .spinner-ring {
          width: 12px;
          height: 12px;
          border: 2px solid #d6ba5c;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 4px;
        }

        .spinner-ring:nth-child(2) {
          animation-delay: 0.2s;
        }

        .spinner-ring:nth-child(3) {
          animation-delay: 0.4s;
        }

        .progress-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .progress-bar {
          width: 200px;
          height: 4px;
          background-color: rgba(166, 94, 58, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #d6ba5c, #f1b3a2);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #a65e3a;
          font-weight: 500;
        }

        .decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .decorative-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .circle-1 {
          width: 100px;
          height: 100px;
          background: #a65e3a;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 60px;
          height: 60px;
          background: #d6ba5c;
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .circle-3 {
          width: 80px;
          height: 80px;
          background: #f1b3a2;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @media (max-width: 768px) {
          .app-title {
            font-size: 2.5rem;
          }
          
          .progress-bar {
            width: 150px;
          }
        }
      `}</style>
    </div>
  );
}
