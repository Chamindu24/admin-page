/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Use 'standalone' for serverless deployment
    experimental: {
      outputFileTracing: true,
    },
  };
  
  export default nextConfig;
  