import type { NextConfig } from "next";

module.exports = {
  images: {
    remotePatterns: [new URL('https://xivbffnvuxikewhnvxfq.supabase.co/**')],
  },
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
