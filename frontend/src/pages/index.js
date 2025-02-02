import { Button, Container, Typography, Box, Card, CardContent, CardActions, TextField } from "@mui/material";
import { useRouter } from "next/router";

const people = [
  { name: "Elon Musk", desc: "Big CEO" },
  { name: "Epicurus", desc: "Nihilistic Philosopher" },
  { name: "Bill Gates", desc: "Microsoft Founder" },
  { name: "Marie Curie", desc: "Scientist" }
];

function ProfileCard({ person }) {
  const router = useRouter();

  const handleChat = () => {
    router.push(`/chat?profile=${encodeURIComponent(person.name)}`);
  };

  return (
    <Card variant="outlined" sx={{ flex: "1 1 calc(25% - 16px)" }}>
      <CardContent>
        <Typography sx={{ fontWeight: 600 }}>{person.name}</Typography>
        <Typography color="text.secondary">{person.desc}</Typography>
      </CardContent>
      <CardActions>
        <Button variant="outlined" onClick={handleChat}>Chat</Button>
      </CardActions>
    </Card>
  );
}

export default function Home() {
  return (
    <Container sx={{ my: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Profiles
      </Typography>
      <TextField
        hiddenLabel
        fullWidth
        sx={{ my: 2 }}
        id="filled-hidden-label-small"
        variant="outlined"
        label="Search profile..."
        size="small"
      />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          flexDirection: "row",
          gap: 2,
          my: 1
        }}
      >
        {people.map((person, index) => (
          <ProfileCard key={index} person={person} />
        ))}
      </Box>
    </Container>
  );
}
