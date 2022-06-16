const express = require("express");

const logger = require("../startup/logging");
const db = require("../startup/db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");
const { Stock, validateStock } = require("../models/stock");

const router = express.Router();

router.post("/", [auth, validate(validateStock)], async (req, res) => {
  const { symbol, name } = req.body;
  const stock = new Stock(symbol, name);

  try {
    const { rows } = await db.query(
      "INSERT INTO stocks (symbol, name) VALUES ($1, $2) RETURNING id",
      [stock.symbol, stock.name]
    );

    res.send(rows[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM stocks WHERE id = $1", [id]);

    res.send("Stock deleted.");
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/", [auth], async (req, res) => {
  try {
    const { rows: stocks } = await db.query("SELECT * FROM stocks");

    res.send(stocks);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/symbols", async (req, res) => {
  try {
    const { rows: symbols } = await db.query("SELECT id, symbol FROM stocks");

    res.send(symbols);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/:id", [auth], async (req, res) => {
  const { id } = req.params;

  try {
    const { rows: stocks } = await db.query(
      "SELECT * FROM stocks WHERE id = $1",
      [id]
    );

    res.send(stocks);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.put("/:id", [auth, validate(validateStock)], async (req, res) => {
  const { id } = req.params;
  const { symbol, name } = req.body;
  const stock = new Stock(symbol, name);

  try {
    await db.query("UPDATE stocks SET symbol = $1, name = $2 WHERE id = $3", [
      stock.symbol,
      stock.name,
      id,
    ]);

    logger.info(
      `Security id ${id} updated, new values: {symbol: ${stock.symbol}, name: ${stock.name}}.`
    );
    res.send().status(200);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { averageAnalystRating, regularMarketPrice, marketCap } = req.body;

  try {
    await db.query(
      "UPDATE stocks SET average_analyst_rating = $1, close_price = $2, marketcap = $3 WHERE id = $4",
      [averageAnalystRating, regularMarketPrice, marketCap, id]
    );
    res.send("stock updated").status(200);
  } catch (error) {
    logger.error(error.message, error);
  }
});

module.exports = router;
