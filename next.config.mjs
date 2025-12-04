/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@gemini-wallet/core': false,
      '@metamask/sdk': false,
      '@walletconnect/ethereum-provider': false,
      'porto': false,
    };
    return config;
  },
};

export default nextConfig;
