import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['@mediapipe/hands', '@mediapipe/camera_utils'],
};

export default nextConfig;
