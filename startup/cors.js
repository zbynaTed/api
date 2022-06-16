const cors = require("cors");
const logger = require("./logging");

module.exports = function (app) {
  app.use(
    cors({
      origin: [
        "https://beran-stack-interface.herokuapp.com",
        "http://beran-stack-interface.herokuapp.com",
      ],
      methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    })
  );
  logger.info("Cors set.");
};
