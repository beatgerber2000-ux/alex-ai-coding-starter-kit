import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security-Header für alle Routen (siehe docs/production/security-headers.md
  // und .claude/rules/security.md). Schützt vor Clickjacking, MIME-Sniffing,
  // erzwingt HTTPS und begrenzt Referrer-Informationen.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
