import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center py-8 px-4 relative overflow-hidden font-sans selection:bg-[#ff00ff]/30 text-white">
      {/* Abstract Background glows */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#00ffff] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-[#ff00ff] rounded-full blur-[150px] opacity-[0.06] pointer-events-none"></div>

      {/* Header */}
      <header className="mb-6 text-center z-10 w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#ff00ff] drop-shadow-[0_0_10px_rgba(255,0,255,0.3)] tracking-tighter uppercase">
          Neon Link
        </h1>
        <p className="mt-1 text-[#00ffff] font-mono text-xs tracking-[0.3em] uppercase opacity-80 text-glow-cyan">
          Grid Integration Active
        </p>
      </header>

      {/* Main Content Area */}
      <main className="z-10 flex flex-col items-center w-full max-w-4xl gap-6">
        {/* Game Area */}
        <section className="w-full flex justify-center">
          <SnakeGame />
        </section>

        {/* Music Player Area */}
        <section className="w-full flex justify-center">
          <MusicPlayer />
        </section>
      </main>
      
      {/* Footer Details */}
      <footer className="absolute bottom-2 left-4 font-mono text-[10px] text-white/30 tracking-[0.2em] uppercase">
        v1.0.0 // AI_STUDIO_BUILD
      </footer>
    </div>
  );
}
