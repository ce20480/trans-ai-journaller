"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export default function VideoSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasWindow, setHasWindow] = useState(false);
  const videoId = "0Wewk1EFAUY";
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  // Check if window is available (client-side)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  return (
    <section className="py-20 bg-[#010101]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See T2A in Action
            </h2>
            <p className="text-lg text-[#b3b3b3] max-w-2xl mx-auto">
              Watch how our second brain system captures and organizes your
              ideas, making sure you never lose a brilliant thought again.
            </p>
          </div>

          <div className="rounded-xl overflow-hidden shadow-2xl shadow-[#facc15]/10 border border-[#262626] relative">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#facc15]/10 to-transparent z-10 pointer-events-none"></div>

            <div className="aspect-video relative bg-[#1a1a1a]">
              {hasWindow && (
                <ReactPlayer
                  url={`https://youtu.be/${videoId}`}
                  width="100%"
                  height="100%"
                  playing={false}
                  controls={true}
                  light={thumbnailUrl}
                  playIcon={
                    <div className="w-20 h-20 rounded-full bg-[#facc15] flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 z-20">
                      <svg
                        className="w-10 h-10 text-black ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  }
                  onReady={() => setIsLoaded(true)}
                  config={{
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        rel: 0,
                      },
                    },
                  }}
                />
              )}

              {!isLoaded && !hasWindow && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="bg-[#262626] px-6 py-3 rounded-full text-[#b3b3b3] flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#facc15]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
              </svg>
              <span>Experience the future of idea management</span>
            </div>
            <a
              href={`https://youtu.be/${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#facc15] hover:underline flex items-center"
            >
              <span>Watch on YouTube</span>
              <svg
                className="w-4 h-4 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1h6zm11-3v8h-2V6.413l-7.793 7.794-1.414-1.414L17.585 5H13V3h8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
