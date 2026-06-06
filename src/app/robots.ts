import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://grasp.ai";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings/", "/profile/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
