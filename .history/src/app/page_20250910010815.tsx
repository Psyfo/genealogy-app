"use client";
import GraphViewer from "@/components/GraphViewer";
import SplashPage from "@/components/SplashPage";
import { useState } from "react";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Add a small delay to ensure smooth transition
    setTimeout(() => setIsLoading(false), 100);
  };

  if (showSplash) {
    return <SplashPage onComplete={handleSplashComplete} minDisplayTime={5000} />;
  }

  return (
    <main className='bg-dairy-cream p-6 min-h-screen text-brown-rust'>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className='mb-2 font-heading font-semibold text-brown-rust text-4xl'>
            Family Tree
          </h1>
          <p className='font-body text-brown-rust/80 text-lg'>
            Discover Your Heritage
          </p>
        </header>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="mx-auto mb-4 border-tacha border-b-2 rounded-full w-12 h-12 animate-spin"></div>
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
