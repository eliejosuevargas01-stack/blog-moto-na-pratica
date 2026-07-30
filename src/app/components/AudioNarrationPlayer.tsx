"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Headphones, RotateCcw, FastForward } from "lucide-react";

interface AudioNarrationPlayerProps {
  audioUrl?: string | null;
  title?: string;
  lang?: string;
}

export default function AudioNarrationPlayer({ audioUrl, title, lang = "pt" }: AudioNarrationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoaded(false);
  }, [audioUrl]);

  if (!audioUrl) {
    return null;
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => console.error("Erro ao reproduzir áudio:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoaded(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const headerText =
    lang === "en" ? "Listen to Article Narration" : lang === "es" ? "Escuchar Narración del Artículo" : "Ouça a Narração deste Post";

  return (
    <div className="w-full my-6 bg-[#161616] border border-primary/30 rounded-lg p-4 md:p-5 shadow-xl relative overflow-hidden group">
      {/* Background Subtle Accent Glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />

      <div className="flex flex-col gap-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Headphones size={16} className={isPlaying ? "animate-bounce text-primary" : "text-primary/80"} />
            <span>{headerText}</span>
          </div>

          {/* Audio Equalizer Wave Animation (Only when playing) */}
          {isPlaying && (
            <div className="flex items-end gap-1 h-3">
              <span className="w-1 bg-primary animate-[bounce_1s_infinite_100ms] rounded-full h-full" />
              <span className="w-1 bg-primary animate-[bounce_1s_infinite_300ms] rounded-full h-2/3" />
              <span className="w-1 bg-primary animate-[bounce_1s_infinite_200ms] rounded-full h-full" />
              <span className="w-1 bg-primary animate-[bounce_1s_infinite_400ms] rounded-full h-1/2" />
            </div>
          )}
        </div>

        {/* Player Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-1">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
            className="w-12 h-12 rounded-full bg-primary hover:bg-[#E05300] text-white flex items-center justify-center transition-all transform hover:scale-105 shadow-md shadow-primary/20 shrink-0"
          >
            {isPlaying ? <Pause size={22} className="fill-white" /> : <Play size={22} className="fill-white ml-0.5" />}
          </button>

          {/* Progress Slider and Timer */}
          <div className="flex-1 w-full space-y-1">
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, #E05300 ${(currentTime / (duration || 1)) * 100}%, #2A2A2A ${(currentTime / (duration || 1)) * 100}%)`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Secondary Controls (Speed & Volume) */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            {/* Speed Toggle */}
            <button
              type="button"
              onClick={changePlaybackRate}
              className="text-[11px] font-mono font-bold text-muted-foreground hover:text-white bg-[#222222] border border-border px-2 py-1 rounded transition-colors"
              title="Velocidade de reprodução"
            >
              {playbackRate}x
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={toggleMute} className="text-muted-foreground hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1.5 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-primary hidden md:block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
