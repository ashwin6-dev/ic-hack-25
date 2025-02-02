import { useRouter } from "next/router";
import { Button, Container, TextField, Box, Paper, Typography, useTheme } from "@mui/material";

// Mock chat messages
const messages = [
  { sender: "AI", text: "Hello! How can I help you today?" },
  { sender: "User", text: "Tell me a joke!" },
  { sender: "AI", text: "Why did the AI break up with the computer? It just didn't feel the connection!" },
  { sender: "User", text: "Haha! That's a good one." }
];

export default function Chat() {
  const router = useRouter();
  const { profile } = router.query;
  const theme = useTheme(); // Access theme colors

  return (
    <Container 
      sx={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "90vh", 
        p: 2
      }}
    >
      {/* Chat Title from URL */}
      <Typography variant="h5" align="center" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
        {profile ? decodeURIComponent(profile) : "Loading..."}
      </Typography>

      {/* Chat Messages Section */}
      <Box 
        sx={{
          flexGrow: 1, 
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 1
        }}
      >
        {messages.map((msg, index) => (
          <Paper 
            key={index} 
            sx={{
              p: 1.5,
              maxWidth: "75%",
              alignSelf: msg.sender === "User" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "AI" ? theme.palette.primary.main : "background.paper",
              color: msg.sender === "AI" ? theme.palette.primary.contrastText : "inherit",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {msg.sender}
            </Typography>
            <Typography variant="body1">{msg.text}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Chat Input Box */}
      <Paper 
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
          mt: 2,
          p: 1,
          boxShadow: "0 -2px 5px rgba(0,0,0,0.1)"
        }}
      >
        {/* Message Input Field */}
        <TextField
          fullWidth
          variant="outlined"
          label="Enter message..."
          size="small"
        />

        {/* Send Button */}
        <Button variant="outlined" color="primary">
          Send
        </Button>
      </Paper>
    </Container>
  );
}
