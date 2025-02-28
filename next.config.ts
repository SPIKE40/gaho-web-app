import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sshj.s3.ap-northeast-2.amazonaws.com",
        pathname: "/club/**", // 필요에 따라 경로 패턴 지정
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
