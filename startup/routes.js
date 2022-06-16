const express = require("express");

const auth = require("../routes/auth");
const users = require("../routes/users");
const stocks = require("../routes/stocks");
const trades = require("../routes/trades");
const holdings = require("../routes/holdings");
const settings = require("../routes/settings");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/stocks", stocks);
  app.use("/api/trades", trades);
  app.use("/api/holdings", holdings);
  app.use("/api/settings", settings);
  app.use("/api/auth", auth);
  app.use(error);
};
