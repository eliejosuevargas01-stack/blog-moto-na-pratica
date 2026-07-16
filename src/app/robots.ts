import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motonapratica.dominuslabs.online";
  if (baseUrl.includes("motonapratica.com.br")) {
    baseUrl = "https://motonapratica.dominuslabs.online";
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
