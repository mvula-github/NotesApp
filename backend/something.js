app.post("/create-account", async (req, res) => {
  try {
    const response = await axios.post(
      `http://localhost:${process.env.AUTH_PORT}/register`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: true, message: "Auth service error" });
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const response = await axios.post(
      `http://localhost:${process.env.AUTH_PORT}/login`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: true, message: "Auth service error" });
  }
});

app.get("/get-user", authenticateToken, async (req, res) => {
  try {
    // Forward the JWT token to the microservice
    const response = await axios.get(
      `http://localhost:${process.env.AUTH_PORT}/me`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: true, message: "Auth service error" });
  }
});
