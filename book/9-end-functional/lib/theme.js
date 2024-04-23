/* eslint-disable linebreak-style */
/* eslint-disable no-multiple-empty-lines */

import { createTheme } from '@mui/material/styles';

// Define a custom MUI theme
const theme = createTheme({
  palette: {
    primary: { main: '#238636' }, // Define primary color
    secondary: { main: '#b62324' }, // Define secondary color
    mode: 'light', // Light mode
    background: { default: '#fff' }, // Default background color
    text: {
      primary: '#222', // Primary text color
    },
  },
  typography: {
    fontFamily: ['IBM Plex Mono', 'monospace'].join(','), // Define font family
    button: {
      textTransform: 'none', // Disable text transformation for buttons
    },
  },
});

export { theme };
