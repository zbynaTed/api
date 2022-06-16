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
    const { rows: holdings } = await db.query(
      "SELECT id_stock AS id, stocks.symbol, stocks.name, SUM(fee) AS total_fee, COUNT(id_stock) AS trade_count, stocks.close_price, stocks.marketcap, stocks.average_analyst_rating AS analysts, SUM(CASE WHEN buy IS true THEN quantity ELSE -quantity END) AS holdings, SUM(CASE WHEN buy IS true THEN price*quantity END) AS total_amount_buy, SUM(CASE WHEN buy IS false THEN price*quantity END) AS total_amount_sell, SUM(CASE WHEN buy IS true THEN quantity END) AS total_quantity_buy, SUM(CASE WHEN buy IS false THEN quantity END) AS total_quantity_sell FROM trades INNER JOIN stocks ON stocks.id = trades.id_stock WHERE id_user = $1 GROUP BY id_stock, stocks.symbol, stocks.name, close_price, marketcap, average_analyst_rating",
      [id]
    );
    res.send(holdings);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/user/:id/small", [auth], async (req, res) => {
  const { id } = req.params;
  if (Number(req.user.id) !== Number(id))
    return res.status(403).send("Access denied.");

  try {
    const { rows: count } = await db.query(
      "SELECT COUNT(DISTINCT(id_stock)) AS small_caps_count FROM (SELECT id_stock, stocks.marketcap, SUM(CASE WHEN buy IS true THEN quantity ELSE -quantity END) AS holdings FROM trades INNER JOIN stocks ON stocks.id = trades.id_stock WHERE id_user = $1 GROUP BY id_stock, marketcap ) AS t WHERE t.holdings > 0 AND marketcap < (SELECT small_cap_max FROM settings WHERE id_user = $2) * 10^9",
      [id, id]
    );
    res.send(count[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/user/:id/mid", [auth], async (req, res) => {
  const { id } = req.params;
  if (Number(req.user.id) !== Number(id))
    return res.status(403).send("Access denied.");

  try {
    const { rows: count } = await db.query(
      "SELECT COUNT(DISTINCT(id_stock)) AS mid_caps_count FROM (SELECT id_stock, stocks.marketcap, SUM(CASE WHEN buy IS true THEN quantity ELSE -quantity END) AS holdings FROM trades INNER JOIN stocks ON stocks.id = trades.id_stock WHERE id_user = $1 GROUP BY id_stock, marketcap ) AS t WHERE t.holdings > 0 AND marketcap > (SELECT small_cap_max FROM settings WHERE id_user = $2) * 10^9 AND marketcap < (SELECT mid_cap_max FROM settings WHERE id_user = $3) * 10^9",
      [id, id, id]
    );
    res.send(count[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/user/:id/large", [auth], async (req, res) => {
  const { id } = req.params;
  if (Number(req.user.id) !== Number(id))
    return res.status(403).send("Access denied.");

  try {
    const { rows: count } = await db.query(
      "SELECT COUNT(DISTINCT(id_stock)) AS large_caps_count FROM (SELECT id_stock, stocks.marketcap, SUM(CASE WHEN buy IS true THEN quantity ELSE -quantity END) AS holdings FROM trades INNER JOIN stocks ON stocks.id = trades.id_stock WHERE id_user = $1 GROUP BY id_stock, marketcap ) AS t WHERE t.holdings > 0 AND marketcap > (SELECT mid_cap_max FROM settings WHERE id_user = $2) * 10^9 AND marketcap < (SELECT large_cap_max FROM settings WHERE id_user = $3) * 10^9",
      [id, id, id]
    );
    res.send(count[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

router.get("/user/:id/behemoth", [auth], async (req, res) => {
  const { id } = req.params;
  if (Number(req.user.id) !== Number(id))
    return res.status(403).send("Access denied.");

  try {
    const { rows: count } = await db.query(
      "SELECT COUNT(DISTINCT(id_stock)) AS behemoth_count FROM (SELECT id_stock, stocks.marketcap, SUM(CASE WHEN buy IS true THEN quantity ELSE -quantity END) AS holdings FROM trades INNER JOIN stocks ON stocks.id = trades.id_stock WHERE id_user = $1 GROUP BY id_stock, marketcap ) AS t WHERE t.holdings > 0 AND marketcap > (SELECT large_cap_max FROM settings WHERE id_user = $2) * 10^9",
      [id, id]
    );
    res.send(count[0]);
  } catch (error) {
    logger.error(error.message, error);
  }
});

module.exports = router;
