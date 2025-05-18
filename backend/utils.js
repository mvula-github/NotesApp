const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.error("No Authorization header");
    return res.sendStatus(401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = { user: { _id: decoded.userId } }; // Make sure this matches your JWT payload!
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.sendStatus(403);
  }
}

module.exports = { authenticateToken };
