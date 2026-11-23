import path from "node:path";
import { fileURLToPath } from "node:url";
import createMDX from "@next/mdx";

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    // স্ট্রিং আকারে দিলে Turbopack-এর সাথেও কাজ করে
    remarkPlugins: ["remark-gfm", path.join(here, "lib/mdx/remark-crossref.mjs")],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
