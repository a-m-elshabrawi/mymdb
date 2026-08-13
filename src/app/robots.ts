import type { MetadataRoute } from "next";

// This is a private app — no part of it should be indexed by search
// engines. Disallow everything.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
