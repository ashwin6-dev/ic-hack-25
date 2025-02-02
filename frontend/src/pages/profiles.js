import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Container, Box, Typography, TextField, Button, Card, CardContent, CircularProgress } from "@mui/material";

export default function ChatPage() {
  const router = useRouter();
  const [people, setPeople] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch("http://localhost:5000/get_profiles");
        const data = await res.json();
        setPeople(data.profiles || []);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };
    fetchProfiles();
  }, []);

  // Send message & fetch AI response
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedProfile) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/query_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedProfile.name, query: input }),
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
    <Container sx={{ my: 2, height: "80vh", display: "flex", boxShadow: 2, borderRadius: 2, overflow: "hidden" }}>
      {/* Left Sidebar: Profiles List */}
      <Box sx={{ width: 300, bgcolor: "background.paper", borderRight: "1px solid #ddd", overflowY: "auto" }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
          Profiles
        </Typography>
        <TextField fullWidth variant="outlined" placeholder="Search..." sx={{ px: 2, mb: 2 }} size="small" />

        {people.length > 0 ? (
          people.map((person, index) => (
            <Card
              key={index}
              variant="outlined"
              sx={{
                mb: 1,
                mx: 2,
                cursor: "pointer",
                "&:hover": { bgcolor: "grey.100" },
                ...(selectedProfile?.name === person.name && { bgcolor: "primary.light", color: "white" }),
              }}
              onClick={() => setSelectedProfile(person)}
            >
              <CardContent>
                <Typography sx={{ fontWeight: 600 }}>{person.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {person.description || "No description"}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography sx={{ px: 2 }}>No profiles found.</Typography>
        )}
      </Box>

      {/* Right Chat Window */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        {selectedProfile ? (
          <>
            {/* Chat Header */}
            <Box sx={{ bgcolor: "primary.main", color: "white", p: 2 }}>
              <Typography variant="h6">{selectedProfile.name}</Typography>
            </Box>

            {/* Chat Messages */}
            <Box sx={{ flex: 1, p: 2, overflowY: "auto", bgcolor: "grey.50" }}>
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
                  <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "text.secondary" }}>
                    {msg.sender === "user" ? "You" : selectedProfile.name}
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

            {/* Chat Input */}
            <Box sx={{ display: "flex", p: 2, borderTop: "1px solid #ddd" }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button variant="contained" sx={{ ml: 1 }} onClick={handleSendMessage}>
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography variant="h6" color="text.secondary">
              Select a profile to start chatting
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
