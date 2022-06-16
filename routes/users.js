const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

const userConfigs = require("../data/config.json");
const { User, validateUser } = require("../models/user");
const db = require("../startup/db");
const logger = require("../startup/logging");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/", [validate(validateUser)], async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User(name, email, password);
  const {
    most_traded_stocks_limit,
    max_trades_per_page,
    small_cap_max,
    mid_cap_max,
    large_cap_max,
  } = userConfigs;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  try {
    const { rows: response } = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) returning id",
      [user.name, user.email, user.password]
    );
    const { id } = response[0];

    await db.query(
      "INSERT INTO settings (id_user, most_traded_stocks_limit, max_trades_per_page, small_cap_max, mid_cap_max, large_cap_max) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        id,
        most_traded_stocks_limit,
        max_trades_per_page,
        small_cap_max,
        mid_cap_max,
        large_cap_max,
      ]
    );

    const token = jwt.sign({ id, name }, config.get("jwtPrivateKey"));

    res.send(token);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/", [auth, admin], async (req, res) => {
  try {
    const { rows: users } = await db.query("SELECT * FROM users");

    res.send(users);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/usernames", async (req, res) => {
  try {
    const { rows: usernames } = await db.query("SELECT email FROM users");

    res.send(usernames);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/:id/fees", [auth], async (req, res) => {
  const { id } = req.params;

  if (Number(req.user.id) !== Number(id))
    return res.status(403).send("Access denied.");

  try {
    const { rows: data } = await db.query(
      "SELECT SUM(fee) FROM trades WHERE id_user = $1",
      [id]
    );

    res.send(data[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

// router.patch("/id/:id", [auth], async (req, res) => {
//   const { id } = req.params;
//   const { most_traded_stocks_limit } = req.body;

//   try {
//     await db.query(
//       "UPDATE users SET most_traded_stocks_limit = $1 WHERE id = $2",
//       [most_traded_stocks_limit, id]
//     );

//     res.send("user data updated").status(200);
//   } catch (error) {
//     logger.error(error.message, error);
//   }
// });

module.exports = router;
