"use client";

import { useEffect, useRef } from "react";

interface AdSenseBlockProps {
  client?: string;
  slot?: string;
  className?: string;
}

export default function AdSenseBlock({
  client = "ca-pub-8759260479603327",
  slot,
  className = ""
}: AdSenseBlockProps) {
  const adRef = useRef<boolean>(false);

  useEffect(() => {
    if (adRef.current) return;
    adRef.current = true;

    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn("AdSense push error:", err);
    }
  }, []);

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center border border-border/40 bg-[#141414] p-4 rounded-sm min-h-[250px] scroll-mt-24 text-center overflow-hidden ${className}`}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-semibold font-mono">
        Publicidade
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "250px" }}
        data-ad-client={client}
        {...(slot ? { "data-ad-slot": slot } : {})}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
