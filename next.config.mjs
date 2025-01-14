/** @type {import('next').NextConfig} */
const nextConfig = {
    target: 'serverless', // Ensures the app is deployed as a serverless function
    webpack(config, { isServer }) {
      // Disable the server-side build of the `canvas` dependency (if you still have it)
      if (isServer) {
        config.externals = ['canvas', ...config.externals];
      }
      return config;
    },
   
  };
  
  export default nextConfig;
  