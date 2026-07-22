import React from "react";
import { Instagram, Youtube } from "lucide-react";

export function TikTokIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function EstradaXIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 19L20 5" />
      <path d="M4 5L20 19" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export interface SocialLinksProps {
  iconSize?: number;
  className?: string;
  showLabels?: boolean;
}

export default function SocialLinks({ iconSize = 15, className = "flex items-center gap-4 text-muted-foreground", showLabels = false }: SocialLinksProps) {
  const links = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/eliejosuevargas2005/",
      icon: <Instagram size={iconSize} />,
    },
    {
      name: "EstradaX",
      url: "https://app.estradax.com.br/profile/eliejosuevargas2005",
      icon: <EstradaXIcon size={iconSize} />,
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@motonapratica",
      icon: <Youtube size={iconSize} />,
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@motonapratica",
      icon: <TikTokIcon size={iconSize} />,
    },
  ];

  return (
    <div className={className}>
      {links.map((item) => (
        <a
          key={item.name}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.name}
          className="hover:text-primary transition-colors flex items-center gap-1.5"
          title={item.name}
        >
          {item.icon}
          {showLabels && <span className="text-[12px] uppercase tracking-wider">{item.name}</span>}
        </a>
      ))}
    </div>
  );
}
