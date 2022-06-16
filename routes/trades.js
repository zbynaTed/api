const express = require("express");

const logger = require("../startup/logging");
const db = require("../startup/db");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/user/:id", [auth], async (req, res) => {
  const { id } = req.params;
  if (Number(req.user.id) !== Number(id))
    return res.status(403).send("Access denied.");

  try {
    const { rows: trades } = await db.query(
      "SELECT trades.id AS id, quantity, price, fee, buy, date, id_stock, symbol, name FROM trades INNER JOIN stocks ON trades.id_stock = stocks.id WHERE id_user = $1",
      [id]
    );

    res.send(trades);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/id/:id", [auth], async (req, res) => {
  const { id } = req.params;

  try {
    const { rows: trade } = await db.query(
      "SELECT trades.id AS id, quantity, price, fee, buy, date, id_stock, id_user, symbol, name FROM trades INNER JOIN stocks ON trades.id_stock = stocks.id WHERE trades.id = $1",
      [id]
    );

    const userId = trade[0].id_user;

    if (Number(req.user.id) !== Number(userId))
      return res.status(403).send("Access denied.");

    res.send(trade[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.post("/", [auth], async (req, res) => {
  const { id_stock, id_user, quantity, price, fee, buy, date } = req.body;

  if (Number(req.user.id) !== Number(id_user))
    return res.status(403).send("Access denied.");

  try {
    const { rows } = await db.query(
      "INSERT INTO trades (id_stock, id_user, quantity, price, fee, buy, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [id_stock, id_user, quantity, price, fee, buy, date]
    );
    res.send(rows[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.delete("/id/:id", [auth], async (req, res) => {
  const { id } = req.params;

  try {
    const { rows: trade } = await db.query(
      "SELECT id_user FROM trades WHERE id = $1",
      [id]
    );
    const userId = trade[0].id_user;
    if (Number(req.user.id) !== Number(userId))
      return res.status(403).send("Access denied.");
  } catch (error) {
    logger.error(error.message, error);
  }

  try {
    await db.query("DELETE FROM trades WHERE id = $1", [id]);
    res.send("Trade deleted.");
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.put("/id/:id", [auth], async (req, res) => {
  const { id } = req.params;
  const { id_stock, quantity, price, fee, buy, date } = req.body;

  try {
    const { rows: trade } = await db.query(
      "SELECT id_user FROM trades WHERE id = $1",
      [id]
    );
    const userId = trade[0].id_user;
    if (Number(req.user.id) !== Number(userId))
      return res.status(403).send("Access denied.");
  } catch (error) {
    logger.error(error.message, error);
  }

  try {
    await db.query(
      "UPDATE trades SET id_stock = $1, quantity = $2, price = $3, fee = $4, buy = $5, date = $6 WHERE id = $7",
      [id_stock, quantity, price, fee, buy, date, id]
    );
    res.send("Trade updated.");
  } catch (error) {
    logger.error(error.message, error);
  }
});

module.exports = router;
