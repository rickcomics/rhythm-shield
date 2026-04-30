import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // отключаем в режиме разработки, чтобы не мешал
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // твои другие настройки, если есть
};

export default withPWA(nextConfig);

