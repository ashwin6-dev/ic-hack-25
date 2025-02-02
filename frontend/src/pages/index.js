import { useState, useEffect } from "react";
import { Box, Typography, TextField, Card, CardContent, Link, Button } from "@mui/material";

export default function ChatPage() {
  const [people, setPeople] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [chats, setChats] = useState({});
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

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

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setChats((prev) => ({ ...prev, [profile.name]: prev[profile.name] || [] }));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedProfile) return;
  
    const newMessage = { sender: "user", text: input };
    const updatedMessages = [...(chats[selectedProfile.name] || []), newMessage];
  
    setChats((prev) => ({ ...prev, [selectedProfile.name]: updatedMessages }));
    setInput("");
    setLoading(true);
  
    try {
      const res = await fetch("http://localhost:5000/query_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedProfile.name,
          query: input,
          chat_history: updatedMessages,  // 🆕 Sends entire chat history
        }),
      });
  
      const data = await res.json();
      const aiMessage = { sender: selectedProfile.name, text: data.message };
  
      setChats((prev) => ({
        ...prev,
        [selectedProfile.name]: [...updatedMessages, aiMessage],
      }));
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", bgcolor: "#000" }}>
      <Sidebar people={people} selectedProfile={selectedProfile} onSelect={handleProfileSelect} />
      <ChatWindow
        selectedProfile={selectedProfile}
        chats={chats}
        input={input}
        setInput={setInput}
        loading={loading}
        onSend={handleSendMessage}
      />
    </Box>
  );
}

function Sidebar({ people, selectedProfile, onSelect }) {
  return (
    <Box sx={{ width: 320, bgcolor: "#111", borderRight: "1px solid #222", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600, color: "white" }}>Profiles</Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search..."
        sx={{
          px: 2,
          mb: 1,
          "& .MuiOutlinedInput-root": {
            color: "white",
            "& fieldset": { borderColor: "#444" },
            "&:hover fieldset": { borderColor: "#666" },
            "&.Mui-focused fieldset": { borderColor: "primary.main" },
          },
        }}
        size="small"
      />

      <Box sx={{ px: 2, mb: 2 }}>
        <Link href="/newProfile" sx={{ color: "primary.main", fontWeight: 500 }}>+ Add Profile</Link>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {people.length > 0 ? (
          people.map((person, index) => (
            <ProfileCard
              key={index}
              person={person}
              isSelected={selectedProfile?.name === person.name}
              onSelect={() => onSelect(person)}
            />
          ))
        ) : (
          <Typography sx={{ px: 2, color: "grey.500" }}>No profiles found.</Typography>
        )}
      </Box>
    </Box>
  );
}

function ProfileCard({ person, isSelected, onSelect }) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        mx: 2,
        cursor: "pointer",
        bgcolor: isSelected ? "#222" : "transparent",
        "&:hover": { bgcolor: "#333" },
        transition: "0.2s",
      }}
      onClick={onSelect}
    >
      <CardContent>
        <Typography sx={{ fontWeight: 600, color: "white" }}>{person.name}</Typography>
        <Typography variant="body2" color="grey.500">
          {person.description || "No description"}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ChatWindow({ selectedProfile, chats, input, setInput, loading, onSend }) {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", bgcolor: "#121212" }}>
      {selectedProfile ? (
        <>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>{selectedProfile.name}</Typography>
          </Box>

          <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
            {(chats[selectedProfile.name] || []).map((msg, index) => (
              <ChatMessage key={index} sender={msg.sender} text={msg.text} />
            ))}

            {loading && <Typography sx={{ color: "primary.main", fontWeight: 600 }}>Typing...</Typography>}
          </Box>

          <Box sx={{ display: "flex", p: 2, borderTop: "1px solid #222" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#333" },
                  "&:hover fieldset": { borderColor: "#555" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="contained" sx={{ ml: 1 }} onClick={onSend}>Send</Button>
          </Box>
        </>
      ) : (
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Typography variant="h6" color="grey.500">Select a profile to start chatting</Typography>
        </Box>
      )}
    </Box>
  );
}

function ChatMessage({ sender, text }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: sender === "user" ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "grey.500" }}>
        {sender === "user" ? "You" : sender}
      </Typography>
      <Typography
        sx={{
          p: 1.5,
          borderRadius: "12px",
          bgcolor: sender === "user" ? "#007bff" : "primary.main",
          color: "white",
          maxWidth: "70%",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
