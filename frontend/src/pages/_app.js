import { ThemeProvider } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "next/link";
import theme from "./theme";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar 
        position="static" 
        sx={{
          boxShadow: "none"
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ flexGrow: 1, fontWeight: "bold", color: "white" }} // Title in white
          >
            <Link href="/" passHref style={{ textDecoration: "none", color: "inherit" }}>
              Echo
            </Link>
          </Typography>
          <Link href="/" passHref>
            <Button 
              color="inherit" 
              sx={{ color: theme.palette.primary.main, "&:hover": { backgroundColor: "transparent" } }}
            >
              Home
            </Button>
          </Link>
          <Link href="/chats" passHref>
            <Button 
              color="inherit" 
              sx={{ color: theme.palette.primary.main, "&:hover": { backgroundColor: "transparent" } }}
            >
              Chats
            </Button>
          </Link>
          <Link href="/profiles" passHref>
            <Button 
              color="inherit" 
              sx={{ color: theme.palette.primary.main, "&:hover": { backgroundColor: "transparent" } }}
            >
              Profiles
            </Button>
          </Link>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 2 }}>
        <Component {...pageProps} />
      </Container>
    </ThemeProvider>
  );
}
