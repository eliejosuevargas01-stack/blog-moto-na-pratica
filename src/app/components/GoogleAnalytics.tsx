"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();

  // Não carregar a tag do Google Analytics nas páginas administrativas (/admin)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script 
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} 
        strategy="lazyOnload" 
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
