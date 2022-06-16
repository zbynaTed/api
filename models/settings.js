const Joi = require("joi");

class Settings {
  constructor(most_traded_stocks_limit) {
    this.symbol = most_traded_stocks_limit;
  }
}

function validateSettings(settings) {
  const { most_traded_stocks_limit } = settings;
  const schema = Joi.object({
    most_traded_stocks_limit: Joi.number().min(1).max(10).required(),
  });
  return schema.validate({ most_traded_stocks_limit });
}

exports.Settings = Settings;
exports.validateSettings = validateSettings;
