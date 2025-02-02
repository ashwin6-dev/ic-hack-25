import React, { useState } from "react";
import { Button, Container, Typography, Box, TextField, RadioGroup, Radio, FormControlLabel, FormControl, FormLabel, IconButton, CircularProgress, Backdrop } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from "next/router";
import { post } from "./utils.js"

export default function AddProfilePage() {
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState(""); // New description state
  const [profileType, setProfileType] = useState(""); // internet or custom
  const [urls, setUrls] = useState([""]); // An array to store multiple URL inputs
  const [loading, setLoading] = useState(false); // To control the loading state
  const router = useRouter();

  // Handle the profile name change
  const handleProfileNameChange = (e) => {
    setProfileName(e.target.value);
  };

  // Handle the profile description change
  const handleProfileDescriptionChange = (e) => {
    setProfileDescription(e.target.value);
  };

  // Handle the profile type selection change
  const handleProfileTypeChange = (e) => {
    setProfileType(e.target.value);
  };

  // Handle individual URL input change
  const handleUrlChange = (index, e) => {
    const newUrls = [...urls];
    newUrls[index] = e.target.value;
    setUrls(newUrls);
  };

  // Add a new URL input field
  const handleAddUrl = () => {
    setUrls([...urls, ""]);
  };

  // Remove a URL input field
  const handleRemoveUrl = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true); // Set loading state to true when submitting

    let nonEmptyUrls = urls.filter(url => url !== "");
    const data = {
      name: profileName,
      description: profileDescription, // Include description in the request
      video_urls: nonEmptyUrls,
    };

    try {
      await post("build_profile", data)

      // After submission, navigate to another page or show a success message
      router.push("/"); // Redirect back to the home page
    } catch (error) {
      console.error("Error during profile creation:", error);
    } finally {
      setLoading(false); // Set loading state to false after the request completes
    }
  };

  return (
    <Container sx={{ my: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Add Profile
      </Typography>

      {/* Profile Name Input */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Enter Profile Name"
          variant="outlined"
          value={profileName}
          onChange={handleProfileNameChange}
        />
      </Box>

      {/* Profile Description Input */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          label="Enter Profile Description"
          variant="outlined"
          value={profileDescription}
          onChange={handleProfileDescriptionChange}
          size="small"
        />
      </Box>

      {/* Profile Type Selection */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <FormLabel component="legend">Choose Profile Type</FormLabel>
        <RadioGroup value={profileType} onChange={handleProfileTypeChange} row>
          <FormControlLabel value="internet" control={<Radio />} label="Build from internet" />
          <FormControlLabel value="custom" control={<Radio />} label="Custom build profile" />
        </RadioGroup>
      </FormControl>

      {/* Conditionally render URL input fields for custom profile type */}
      {profileType === "custom" && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter URLs for the profile:
          </Typography>
          {urls.map((url, index) => (
            <Box key={index} sx={{ mb: 2, display: "flex", alignItems: "center" }}>
              <TextField
                fullWidth
                label={`URL ${index + 1}`}
                variant="outlined"
                value={url}
                onChange={(e) => handleUrlChange(index, e)}
                sx={{ mr: 2 }}
                size="small"
              />
              <IconButton
                onClick={() => handleRemoveUrl(index)}
                sx={{
                  color: "error.main",
                  padding: 0,
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" onClick={handleAddUrl} sx={{ mt: 2 }}>
            Add URL
          </Button>
        </Box>
      )}

      {/* Submit button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        fullWidth
        disabled={!profileName || !profileType || (profileType === "custom" && urls.some(url => url.trim() === ""))}
      >
        Submit
      </Button>

      {/* Loading overlay */}
      <Backdrop
        sx={{
          color: "#fff",
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 9999,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
}
