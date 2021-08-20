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
import { compressRouter } from "./middleware/compress.mjs";
import { corsLoose, corsStrict } from "./middleware/cors.mjs";

//npm modules
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

const app = express();
const limiter = rateLimit({
  windowMs: config.optimization.RATE_LIMIT_WINDOWMS * 60 * 1000,
  max: config.optimization.RATE_LIMIT_MAX,
});

//Middleware
app.use(httpLogger);
app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: { ...corsLoose.origin, ...corsStrict.origin },
    optionSuccessStatus: 200,
  })
);

app.get("/compress", (req, res) => {
  let result = "Rain today dry tomorrow, save a almond just in case ";
  res.send(result.repeat(100000));
});

app.listen(config.server.PORT, config.server.HOST, () => {
  logger.info(
    `Server Started and Listening on ${config.server.HOST}:${config.server.PORT} in a ${config.environment.NODE_ENV} environment.`
  );
});
