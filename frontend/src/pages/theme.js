import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark", // Enables dark mode
    primary: {
      main: "#bb86fc", // Light purple (Material UI dark theme accent)
    },
    secondary: {
      main: "#7717d1", // Your original purple accent
    },
    background: {
      default: "#121212", // Dark background
      paper: "#1e1e1e", // Slightly lighter card background
    },
    text: {
      primary: "#ffffff", // Ensures text is readable in dark mode
      secondary: "#b0b0b0", // Softer gray for secondary text
    },
  },
  typography: {
    fontFamily: "Segoe UI"
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Optional: Keeps button text normal case
          borderRadius: 8, // Slightly rounded buttons for modern look
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e1e", // Match paper background
          color: "#ffffff", // Ensure text is visible on dark cards
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#121212"
        },
      },
    },
  },
});

export default theme;
