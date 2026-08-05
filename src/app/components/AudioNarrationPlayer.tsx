"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Headphones, RotateCcw, FastForward, 
  ChevronLeft, ChevronRight, Rewind 
} from "lucide-react";

interface AudioNarrationPlayerProps {
  audioUrl?: string | null;
  title?: string;
  lang?: string;
}

export default function AudioNarrationPlayer({ audioUrl, title, lang = "pt" }: AudioNarrationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoaded(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFloatingVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!audioUrl) {
    return null;
  }

  const updateAudioDuration = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        updateAudioDuration();
      }).catch((err) => console.error("Erro ao reproduzir áudio:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (duration === 0) {
        updateAudioDuration();
      }
    }
  };

  const handleLoadedMetadata = () => {
    updateAudioDuration();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const maxDuration = duration > 0 ? duration : 9999;
    const newTime = Math.max(0, Math.min(maxDuration, currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
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
    const rates = [0.75, 1, 1.25, 1.5, 1.75, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0 || !isFinite(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const headerText =
    lang === "en" ? "Listen to Article Narration" : lang === "es" ? "Escuchar Narración del Artículo" : "Ouça a Narração deste Post";

  return (
    <>
      <div 
        ref={containerRef} 
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            skipTime(-10);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            skipTime(10);
          } else if (e.key === " ") {
            e.preventDefault();
            togglePlay();
          }
        }}
        className="w-full my-6 bg-[#161616] border border-primary/30 rounded-lg p-4 md:p-5 shadow-xl relative overflow-hidden group outline-none focus:border-primary/60"
      >
        {/* Background Subtle Accent Glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={updateAudioDuration}
          onCanPlay={updateAudioDuration}
          onEnded={() => setIsPlaying(false)}
          preload="auto"
        />

        <div className="flex flex-col gap-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Headphones size={16} className={isPlaying ? "animate-bounce text-primary" : "text-primary/80"} />
              <span>{headerText}</span>
              <span className="text-[10px] font-normal text-muted-foreground ml-2 hidden sm:inline">(Use as setas ← → para avançar/recuar 10s)</span>
            </div>

            {/* Audio Equalizer Wave Animation */}
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
            {/* Action Buttons: Voltar 10s | Play/Pause | Avançar 10s */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => skipTime(-10)}
                title="Recuar 10 segundos (Seta esquerda)"
                className="w-9 h-9 rounded-full bg-[#222222] border border-border hover:border-primary/50 text-muted-foreground hover:text-white flex items-center justify-center transition-all"
              >
                <Rewind size={16} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
                className="w-12 h-12 rounded-full bg-primary hover:bg-[#E05300] text-white flex items-center justify-center transition-all transform hover:scale-105 shadow-md shadow-primary/20 shrink-0"
              >
                {isPlaying ? <Pause size={22} className="fill-white" /> : <Play size={22} className="fill-white ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => skipTime(10)}
                title="Avançar 10 segundos (Seta direita)"
                className="w-9 h-9 rounded-full bg-[#222222] border border-border hover:border-primary/50 text-muted-foreground hover:text-white flex items-center justify-center transition-all"
              >
                <FastForward size={16} />
              </button>
            </div>

            {/* Progress Slider and Timer (Permite arrastar até o segundo exato) */}
            <div className="flex-1 w-full space-y-1">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration > 0 ? duration : 1}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Arrastar posição do áudio"
                  title={`Posição atual: ${formatTime(currentTime)}`}
                  className="w-full h-2.5 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #E05300 ${progressPercent}%, #2A2A2A ${progressPercent}%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span className="text-white font-semibold">{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Secondary Controls (Speed & Volume) */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              {/* Speed Toggle (0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x) */}
              <button
                type="button"
                onClick={changePlaybackRate}
                className="text-[11px] font-mono font-bold text-muted-foreground hover:text-white bg-[#222222] border border-border px-2 py-1 rounded transition-colors"
                title="Clique para alterar velocidade (0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x)"
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

      {/* Floating Sticky Quick Player (Shown on Scroll) */}
      {isFloatingVisible && (
        isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            title="Expandir player de narração"
            className="fixed bottom-6 right-0 z-50 flex items-center gap-2 bg-[#141414]/95 backdrop-blur-md border-l-2 border-y border-l-primary border-primary/40 pl-3 pr-2 py-2.5 rounded-l-full shadow-2xl shadow-black/90 text-primary hover:text-white transition-all duration-300 hover:bg-primary/20 group"
          >
            <ChevronLeft size={18} className="animate-pulse group-hover:-translate-x-0.5 transition-transform" />
            <Headphones size={16} className={isPlaying ? "animate-bounce text-primary" : ""} />
            {isPlaying && (
              <span className="text-[10px] font-mono text-white font-bold pr-1">
                {formatTime(currentTime)}
              </span>
            )}
          </button>
        ) : (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 bg-[#141414]/95 backdrop-blur-md border border-primary/40 px-4 py-3 rounded-2xl shadow-2xl shadow-black/90 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 max-w-sm">
            <div className="flex items-center gap-3">
              {/* Skip Back 10s */}
              <button
                type="button"
                onClick={() => skipTime(-10)}
                title="Recuar 10s"
                className="text-muted-foreground hover:text-white"
              >
                <Rewind size={15} />
              </button>

              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pausar narração" : "Reproduzir narração"}
                className="w-9 h-9 rounded-full bg-primary hover:bg-[#E05300] text-white flex items-center justify-center transition-all transform hover:scale-105 shadow-md shadow-primary/30 shrink-0"
              >
                {isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-white ml-0.5" />}
              </button>

              {/* Skip Forward 10s */}
              <button
                type="button"
                onClick={() => skipTime(10)}
                title="Avançar 10s"
                className="text-muted-foreground hover:text-white"
              >
                <FastForward size={15} />
              </button>

              {/* Track Info */}
              <div className="flex flex-col cursor-pointer select-none flex-1 min-w-0" onClick={togglePlay}>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[11px] font-bold text-white tracking-wide uppercase truncate">
                    {isPlaying ? "Narração" : "Pausado"}
                  </span>
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-2.5 shrink-0">
                      <span className="w-0.5 bg-primary animate-[bounce_1s_infinite_100ms] rounded-full h-full" />
                      <span className="w-0.5 bg-primary animate-[bounce_1s_infinite_300ms] rounded-full h-2/3" />
                      <span className="w-0.5 bg-primary animate-[bounce_1s_infinite_200ms] rounded-full h-full" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Speed Toggle */}
              <button
                type="button"
                onClick={changePlaybackRate}
                className="text-[10px] font-mono font-bold text-muted-foreground hover:text-white bg-[#222222] border border-border/80 px-1.5 py-0.5 rounded transition-colors"
              >
                {playbackRate}x
              </button>

              {/* Collapse Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1 text-muted-foreground hover:text-white hover:bg-secondary rounded-full transition-colors"
                title="Esconder para a lateral"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Slider no Player Flutuante (Permite arrastar a posição em qualquer lugar da página) */}
            <input
              type="range"
              min={0}
              max={duration > 0 ? duration : 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #E05300 ${progressPercent}%, #2A2A2A ${progressPercent}%)`,
              }}
            />
          </div>
        )
      )}
    </>
  );
}
