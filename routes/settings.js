const express = require("express");

const logger = require("../startup/logging");
const db = require("../startup/db");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { validateSettings } = require("../models/stock");

const router = express.Router();

router.get("/:id", [auth], async (req, res) => {
  const { id } = req.params;

  try {
    const { rows: settings } = await db.query(
      "SELECT * FROM settings WHERE id_user = $1",
      [id]
    );
    res.send(settings[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.patch("/:id", [auth], async (req, res) => {
  const { id } = req.params;
  const {
    most_traded_stocks_limit,
    max_trades_per_page,
    small_cap_max,
    mid_cap_max,
    large_cap_max,
    colorize_holdings
  } = req.body;

  try {
    await db.query(
      "UPDATE settings SET most_traded_stocks_limit = $1, max_trades_per_page = $2, small_cap_max = $3, mid_cap_max = $4, large_cap_max = $5, colorize_holdings = $6 WHERE id_user = $7",
      [
        most_traded_stocks_limit,
        max_trades_per_page,
        small_cap_max,
        mid_cap_max,
        large_cap_max,
        colorize_holdings,
        id,
      ]
    );
    res.send("settings updated").status(200);
  } catch (error) {
    logger.error(error.message, error);
  }
});

module.exports = router;
