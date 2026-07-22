"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, MapPin, Flag } from "lucide-react";
import { TEKO } from "../data";

interface EventCountdownProps {
  eventName: string;
  circuitOrLocation: string;
  category: string; // Pista, Road Racing, Off-Road
  targetDate: string; // ISO String or date string e.g. "2026-08-16T14:00:00Z"
  flagEmoji?: string;
}

export default function EventCountdown({
  eventName,
  circuitOrLocation,
  category,
  targetDate,
  flagEmoji = "🏁",
}: EventCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isLive: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="bg-card border border-border p-5 rounded-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-secondary text-primary border border-primary/20">
            {category}
          </span>
          <span className="text-[13px]">{flagEmoji}</span>
        </div>

        <h3 style={TEKO} className="text-[24px] font-semibold uppercase leading-tight text-foreground mb-1">
          {eventName}
        </h3>
        <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-4">
          <MapPin size={11} className="text-primary shrink-0" /> {circuitOrLocation}
        </p>
      </div>

      {timeLeft.isLive ? (
        <div className="bg-red-950/40 border border-red-800/40 p-3 rounded-sm text-center">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-ping mr-2" />
          <span style={TEKO} className="text-[18px] uppercase tracking-wider text-red-400 font-bold">
            Evento em Andamento / AO VIVO!
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-center bg-[#0F0F0F] border border-border/40 p-2.5 rounded-sm">
          <div>
            <span style={TEKO} className="text-[24px] font-bold leading-none text-foreground block">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Dias</span>
          </div>
          <div>
            <span style={TEKO} className="text-[24px] font-bold leading-none text-foreground block">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Horas</span>
          </div>
          <div>
            <span style={TEKO} className="text-[24px] font-bold leading-none text-foreground block">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Min</span>
          </div>
          <div>
            <span style={TEKO} className="text-[24px] font-bold leading-none text-primary block">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Seg</span>
          </div>
        </div>
      )}
    </div>
  );
}
