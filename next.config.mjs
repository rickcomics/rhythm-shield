import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Убрали skipWaiting и register, плагин сам разберется по дефолту
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оставляем пустым, чтобы не было конфликтов типов с экспериментальными фичами
};

export default withPWA(nextConfig);
