// Import necessary module
const withTM = require('next-transpile-modules')([
  '@mui/icons-material', // Transpile MUI icons material
]);

// Export configuration object with next-transpile-modules settings
module.exports = withTM({
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript build errors
  },
  poweredByHeader: false, // Hide Next.js "powered by" header
  swcMinify: true, // Enable SWC minification
  experimental: {
    forceSwcTransforms: true, // Force SWC transforms
  },
  modularizeImports: {
    '@mui/material/?(((\\w*)?/?)*)': {
      // Transform imports for '@mui/material' package
      transform: '@mui/material/{{ matches.[1] }}/{{member}}', // Apply transformation
    },
    '@mui/icons-material/?(((\\w*)?/?)*)': {
      // Transform imports for '@mui/icons-material' package
      transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}', // Apply transformation
    },
  },
});
