const { paraglide } = require('@inlang/paraglide-next/plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // ✅ Add Google profile image host
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com', // ✅ Add Vimeo CDN host
      },
      {
        protocol: 'https',
        hostname: 'idr01.zata.ai', // ✅ Add Zata AI host for video thumbnails
      },
    ],
  },
};

module.exports = paraglide({
  paraglide: {
    project: './project.inlang',
    outdir: './src/paraglide',
  },
  ...nextConfig,
});
