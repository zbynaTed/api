const Joi = require("joi");

class Stock {
  constructor(symbol, name) {
    this.symbol = symbol;
    this.name = name;
  }
}

function validateStock(stock) {
  const { symbol, name } = stock;
  const schema = Joi.object({
    symbol: Joi.string().min(1).max(10).required(),
    name: Joi.string().min(5).max(255).required(),
  });
  return schema.validate({ symbol, name });
}

exports.Stock = Stock;
exports.validateStock = validateStock;
