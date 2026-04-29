import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Disc } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'SYNTHESIS ALPHA // AI_GEN', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'NEURAL BETA // AI_GEN', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 3, title: 'DEEP GAMMA // AI_GEN', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const track = TRACKS[currentTrackIdx];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIdx]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const skipForward = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };
  
  const skipBackward = () => {
    setCurrentTrackIdx((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    skipForward();
  };

  return (
    <div className="w-full max-w-[400px] bg-[#050505] border border-[#ff00ff] border-glow-magenta rounded-xl p-5 flex flex-col shadow-2xl relative overflow-hidden">
      {/* Decorative bg element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff00ff] rounded-full filter blur-[80px] opacity-20 pointer-events-none"></div>
      
      <audio 
        ref={audioRef} 
        src={track.url} 
        onEnded={handleEnded}
        preload="metadata"
      />
      
      {/* Top info area */}
      <div className="flex items-center space-x-4 mb-5 z-10">
        <div className={`w-12 h-12 rounded-full border border-glow-cyan bg-black flex place-items-center justify-center shrink-0 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
          <Disc className="w-6 h-6 text-[#00ffff] drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] text-[#ff00ff] uppercase tracking-[0.2em] font-mono mb-1 text-glow-magenta">Now Playing</p>
          <div className="relative w-full overflow-hidden whitespace-nowrap">
             <div className={`${isPlaying ? 'animate-[marquee_15s_linear_infinite]' : ''} inline-block`}>
                <h3 className="text-white font-bold text-sm sm:text-base tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                   {track.title}
                </h3>
             </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between z-10 px-1">
        <div className="flex items-center space-x-5">
          <button onClick={skipBackward} className="text-white/70 hover:text-white transition-colors hover:drop-shadow-[0_0_5px_#ffffff]">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#00ffff] hover:glow-cyan transition-all duration-300"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>
          
          <button onClick={skipForward} className="text-white/70 hover:text-white transition-colors hover:drop-shadow-[0_0_5px_#ffffff]">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center space-x-2 group">
          <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-[#00ffff] transition-colors focus:outline-none">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00ffff] focus:outline-none focus:ring-1 focus:ring-[#00ffff]"
          />
        </div>
      </div>
    </div>
  );
}
