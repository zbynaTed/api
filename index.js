const express = require("express");

const app = express();

require("./startup/config")();
require("./startup/logging");
require("./startup/cors")(app);
require("./startup/server")(app);
require("./startup/routes")(app);
require("./startup/db");
require("./startup/quoteCall")();