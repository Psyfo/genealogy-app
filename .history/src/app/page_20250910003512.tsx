'use client';

import { useState } from 'react';
import SplashPage from '@/components/SplashPage';
import GraphViewer from '@/components/GraphViewer';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Add a small delay to ensure smooth transition
    setTimeout(() => setIsLoading(false), 100);
  };

  if (showSplash) {
    return <SplashPage onComplete={handleSplashComplete} minDisplayTime={3000} />;
  }

  return (
    <main className='min-h-screen bg-dairy-cream text-brown-rust p-6'>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className='font-heading text-4xl font-semibold mb-2 text-brown-rust'>
            Family Tree
          </h1>
          <p className='font-body text-lg text-brown-rust/80'>
            Discover Your Heritage
          </p>
        </header>
        
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tacha mx-auto mb-4"></div>
              <p className="font-body text-brown-rust">Loading your family tree...</p>
            </div>
          </div>
        ) : (
          <GraphViewer />
        )}
      </div>
    </main>
  );
}
