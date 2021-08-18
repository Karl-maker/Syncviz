/*
Author: Karl-Johan Bailey 17/08/2021

This file will:
1. create a server using restify module
2. use a index file from the middleware modules in one line of code
3. listen on port specified by config.mjs file within config folder
*/

import config from "./config/config.mjs";
import logger from "./log/serverLogger.mjs";
import httpLogger from "./log/httpLogger.mjs";

//npm modules
import express from "express";

const app = express();

app.use(httpLogger);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(config.server.PORT, config.server.HOST, () => {
  logger.info(
    `Server Started and Listening on ${config.server.HOST}:${config.server.PORT} in a ${config.environment.NODE_ENV} environment.`
  );
});
