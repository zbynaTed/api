const jwt = require("jsonwebtoken");
const config = require("config");

const logger = require("../startup/logging");

function auth(req, res, next) {
  if (!config.get("requiresAuth")) return next();

  const token = req.header("x-auth-token");

  if (!token) {
    res.status(401).send("Unauthorized access - no token provided.");
  }

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    next();
  } catch (error) {
    logger.error(error);
    res.status(401).send("Invalid token.");
  }
}

module.exports = auth;
