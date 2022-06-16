const config = require("config");
const logger = require("./logging");

const port = process.env.PORT || config.get("port");

module.exports = function (app) {
  return app.listen(port, () => logger.info(`Server running on port ${port}.`));
};
