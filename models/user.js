const Joi = require("joi");

class User {
  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.most_traded_stocks_limit = 5;
  }
}

function validateUser(user) {
  const { name, email, password } = user;
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).email().required(),
    password: Joi.string().min(8).max(30).required(),
    name: Joi.string().min(2).max(30).required(),
  });
  return schema.validate({ name, email, password });
}

exports.User = User;
exports.validateUser = validateUser;
