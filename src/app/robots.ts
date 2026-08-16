import type { MetadataRoute } from "next";

// Only the public marketing landing page ("/") is indexable. Everything else
// is a user's private app surface and must stay out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/home",
        "/library",
        "/diary",
        "/watchlist",
        "/search",
        "/movie",
        "/tv",
        "/login",
        "/signup",
        "/dev",
      ],
    },
  };
}
