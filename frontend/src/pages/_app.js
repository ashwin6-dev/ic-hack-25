import { ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "next/link";
import theme from "./theme";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
       <Component {...pageProps} />
    </ThemeProvider>
  );
}
