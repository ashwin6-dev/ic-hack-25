import { useState } from "react";
import { useRouter } from "next/router";
import { Container, Box, TextField, Button, Typography, CircularProgress } from "@mui/material";

export default function ChatPage() {
  const router = useRouter();
  const { profile } = router.query;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Send user message & fetch AI response
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/query_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile, query: input }),
      });

      const data = await res.json();
      const aiMessage = { sender: "ai", text: data.message };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ my: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Chat with {profile}
      </Typography>

      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: 2,
          height: "60vh",
          overflowY: "auto",
          mb: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary" }}
            >
              {msg.sender === "user" ? "You" : profile}
            </Typography>
            <Typography
              sx={{
                p: 1.5,
                borderRadius: "12px",
                bgcolor: msg.sender === "user" ? "#007bff" : "primary.main",
                color: "white",
                maxWidth: "70%",
              }}
            >
              {msg.text}
            </Typography>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{
                p: 1.5,
                borderRadius: "12px",
                bgcolor: "primary.main",
                color: "white",
                maxWidth: "70%",
                fontStyle: "italic",
              }}
            >
              Typing...
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button variant="contained" onClick={handleSendMessage}>
          Send
        </Button>
      </Box>
    </Container>
  );
}
