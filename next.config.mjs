// 일반 저장소(username.github.io 가 아닌 경우)는 /저장소명 으로 서비스되므로 basePath가 필요합니다.
// GitHub Actions에서 자동으로 채우고, 로컬에서는 비워둡니다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
