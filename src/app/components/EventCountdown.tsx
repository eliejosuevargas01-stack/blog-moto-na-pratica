"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";
import { TEKO } from "../data";

interface EventCountdownProps {
  eventName: string;
  circuitOrLocation: string;
  category: string;
  targetDate: string;
  flagEmoji?: string;
  imageUrl?: string;
}

export default function EventCountdown({
  eventName,
  circuitOrLocation,
  category,
  targetDate,
  flagEmoji = "🏁",
  imageUrl,
}: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });

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

  const defaultImg = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=300&fit=crop&auto=format";

  return (
    <div className="group bg-card border border-border rounded-sm overflow-hidden flex flex-col justify-between hover:border-primary/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* CIRCUIT TRACK IMAGE BANNER */}
      <div className="relative w-full h-[125px] overflow-hidden bg-black">
        <img 
          src={imageUrl || defaultImg} 
          alt={eventName} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-primary text-white shadow-sm rounded-xs">
            {category}
          </span>
          <span className="text-[16px] drop-shadow-md">{flagEmoji}</span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-4 pt-1 flex flex-col flex-1 justify-between">
        <div>
          <h3 style={TEKO} className="text-[23px] font-semibold uppercase leading-tight text-foreground mb-1 group-hover:text-primary transition-colors">
            {eventName}
          </h3>
          <p className="text-[12px] text-muted-foreground flex items-center gap-1.5 mb-4">
            <MapPin size={11} className="text-primary shrink-0" /> {circuitOrLocation}
          </p>
        </div>

        {timeLeft.isLive ? (
          <div className="bg-red-950/40 border border-red-800/40 p-2.5 rounded-sm text-center">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-ping mr-2" />
            <span style={TEKO} className="text-[17px] uppercase tracking-wider text-red-400 font-bold">
              AO VIVO!
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 text-center bg-[#0C0C0C] border border-border/50 p-2 rounded-sm">
            <div>
              <span style={TEKO} className="text-[22px] font-bold leading-none text-foreground block">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Dias</span>
            </div>
            <div>
              <span style={TEKO} className="text-[22px] font-bold leading-none text-foreground block">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Horas</span>
            </div>
            <div>
              <span style={TEKO} className="text-[22px] font-bold leading-none text-foreground block">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Min</span>
            </div>
            <div>
              <span style={TEKO} className="text-[22px] font-bold leading-none text-primary block">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground block">Seg</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
