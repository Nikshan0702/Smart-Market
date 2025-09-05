"use client"; // add this if you're in Next.js App Router (app directory)

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

export default function Home() {
  return (
    <Container sx={{ textAlign: "center", marginTop: 5 }}>
      <Typography variant="h4" gutterBottom>
        ✅ MUI is Working with Next.js 15 + React 19!
      </Typography>
      <Button variant="contained" color="primary">
        Test Button
      </Button>
    </Container>
  );
}
