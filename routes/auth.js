const express = require("express");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const db = require("../startup/db");
const logger = require("../startup/logging");

const router = express.Router();

router.post("/", async (req, res) => {
  const { body: user } = req;

  try {
    const { rows: result } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [user.email]
    );
    const { id, name, email, password, most_traded_stocks_limit } = result[0];
    const token = jwt.sign(
      { id, name, email, most_traded_stocks_limit },
      config.get("jwtPrivateKey")
    );
    const validPassword = await bcrypt.compare(user.password, password);
    if (!validPassword) return res.status(400).send("Invalid credentials.");

    res.send(token);
  } catch (error) {
    logger.error(error.message, error);
    return res.status(400).send("Invalid credentials.");
  }
});

module.exports = router;
