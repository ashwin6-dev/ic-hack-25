import { useState, useEffect } from "react";
import { Box, Typography, TextField, Card, CardContent, Link, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import{ post, get } from "./utils"

export default function ChatPage() {
  const [people, setPeople] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [secondDebater, setSecondDebater] = useState(null);
  const [chats, setChats] = useState({});
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("chat");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await get("get_profiles");
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

  const handleSendMessage = async ()  => {
    if (mode === "chat") sendChatMessage();
    if (mode === "debate") doDebate(selectedProfile.name, secondDebater.name);
  }

  const sendChatMessage = async () => {
    if (!input.trim() || !selectedProfile) return;
  
    const newMessage = { sender: "user", text: input };
    const updatedMessages = [...(chats[selectedProfile.name] || []), newMessage];
  
    setChats((prev) => ({ ...prev, [selectedProfile.name]: updatedMessages }));
    setInput("");
    setLoading(true);
  
    try {
      const data = await post("query_profile", {
        name: selectedProfile.name,
        query: input,
        chat_history: updatedMessages
      });
  
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


  const doDebate = async (profileA, profileB) => {
    const chatHistory = []
    const ROUNDS = 3
    
    let lastMessage = input

    for (let i = 0; i < ROUNDS; i++) {
      for (let profile of [profileA, profileB]) {
        setLoading(true);

        const data = await post("query_profile", {
          name: profile,
          query: lastMessage,
          chat_history: chatHistory
        });
    
        const message = { sender: profile, text: data.message };

        lastMessage = message.text
        chatHistory.push(message)

        setLoading(false);
        setChats((prev) => ({
          ...prev,
          "debate": chatHistory,
        }));
      }
    }
  }
  

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      setSelectedProfile(null);
      setSecondDebater(null);
    }
  };

  return (
    <Box sx={{ height: "100vh", width: "100vw", display: "flex", bgcolor: "#000" }}>
      <Box sx={{ width: 320, bgcolor: "#111", borderRight: "1px solid #222", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 600, color: "white" }}>Mode Selection</Typography>
        
        <Box sx={{ px: 2, mb: 3 }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="chat mode"
            sx={{ 
              width: "100%",
              "& .MuiToggleButton-root": {
                color: "white",
                "&.Mui-selected": {
                  backgroundColor: "#333",
                  color: "primary.main"
                }
              }
            }}
          >
            <ToggleButton value="chat" sx={{ width: "50%" }}>Chat</ToggleButton>
            <ToggleButton value="debate" sx={{ width: "50%" }}>Debate</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Typography variant="h6" sx={{ px: 2, pb: 2, fontWeight: 600, color: "white" }}>
          {mode === "chat" ? "Select Profile" : "Select Debaters"}
        </Typography>

        <Box sx={{ px: 2, mb: 2 }}>
          <Link href="/newProfile" sx={{ color: "primary.main", fontWeight: 500 }}>+ Add Profile</Link>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {people.length > 0 ? (
            people.map((person, index) => (
              <ProfileCard
                key={index}
                person={person}
                isSelected={
                  mode === "chat" 
                    ? selectedProfile?.name === person.name
                    : selectedProfile?.name === person.name || secondDebater?.name === person.name
                }
                isFirstDebater={selectedProfile?.name === person.name}
                isSecondDebater={secondDebater?.name === person.name}
                onSelect={() => {
                  if (mode === "chat") {
                    handleProfileSelect(person);
                  } else {
                    if (!selectedProfile) {
                      setSelectedProfile(person);
                    } else if (!secondDebater && person.name !== selectedProfile.name) {
                      setSecondDebater(person);
                    }
                  }
                }}
                mode={mode}
              />
            ))
          ) : (
            <Typography sx={{ px: 2, color: "grey.500" }}>No profiles found.</Typography>
          )}
        </Box>
        
        {mode === "debate" && (selectedProfile || secondDebater) && (
          <Box sx={{ p: 2, borderTop: "1px solid #222" }}>
            <Button 
              variant="outlined" 
              color="error" 
              fullWidth
              onClick={() => {
                setSelectedProfile(null);
                setSecondDebater(null);
              }}
            >
              Clear Selection
            </Button>
          </Box>
        )}
      </Box>

      <ChatWindow
        mode={mode}
        selectedProfile={selectedProfile}
        secondDebater={secondDebater}
        chats={chats}
        input={input}
        setInput={setInput}
        loading={loading}
        onSend={handleSendMessage}
      />
    </Box>
  );
}

function ProfileCard({ person, isSelected, isFirstDebater, isSecondDebater, onSelect, mode }) {
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
        borderColor: isFirstDebater ? "primary.main" : isSecondDebater ? "secondary.main" : undefined,
      }}
      onClick={onSelect}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 600, color: "white" }}>{person.name}</Typography>
          {mode === "debate" && (
            <Typography variant="caption" sx={{ color: isFirstDebater ? "primary.main" : isSecondDebater ? "secondary.main" : "grey.500" }}>
              {isFirstDebater ? "Debater 1" : isSecondDebater ? "Debater 2" : ""}
            </Typography>
          )}
        </Box>
        <Typography variant="body2" color="grey.500">
          {person.description || "No description"}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ChatWindow({ mode, selectedProfile, secondDebater, chats, input, setInput, loading, onSend }) {
  const isDebateReady = mode === "debate" && selectedProfile && secondDebater;
  const isChatReady = mode === "chat" && selectedProfile;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", bgcolor: "#121212" }}>
      {(isDebateReady || isChatReady) ? (
        <>
          <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #222" }}>
            {mode === "chat" ? (
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
                {selectedProfile.name}
              </Typography>
            ) : (
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
                Debate: {selectedProfile.name} vs {secondDebater.name}
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
            {(mode === "chat" ? chats[selectedProfile.name] : chats["debate"] || []).map((msg, index) => (
              <ChatMessage 
                key={index} 
                sender={msg.sender} 
                text={msg.text} 
                mode={mode} 
                selectedProfile={selectedProfile} 
                secondDebater={secondDebater} 
              />
            ))}
            {loading && <Typography sx={{ color: "primary.main", fontWeight: 600 }}>Typing...</Typography>}
          </Box>

          <Box sx={{ display: "flex", p: 2, borderTop: "1px solid #222" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={mode === "chat" ? "Type a message..." : "Enter debate topic..."}
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
              size="small"
            />
            <Button variant="contained" sx={{ ml: 1 }} onClick={onSend}>
              {mode === "chat" ? "Send" : "Start Debate"}
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Typography variant="h6" color="grey.500">
            {mode === "chat" 
              ? "Select a profile to start chatting" 
              : "Select two profiles to start a debate"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function ChatMessage({ sender, text, mode, selectedProfile, secondDebater }) {
  const isUserMessage = sender === "user";
  const isDebaterMessage = sender === selectedProfile?.name || sender === secondDebater?.name;

  let align = "flex-end"; // Default: messages will appear on the left side
  if (isDebaterMessage) {
    if (sender === selectedProfile?.name) {
      align = "flex-start"; // Debater 1 on the left side
    } else if (sender === secondDebater?.name) {
      align = "flex-end"; // Debater 2 on the right side
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        mb: 2,
      }}
    >
      <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, color: "grey.500" }}>
        {isUserMessage ? "You" : sender}
      </Typography>
      <Typography
        sx={{
          p: 1.5,
          borderRadius: "12px",
          bgcolor: (isUserMessage || sender == secondDebater?.name) ? "#007bff" : "primary.main",
          color: "white",
          maxWidth: "70%",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
