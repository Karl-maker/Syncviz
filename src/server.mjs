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
import { compressorCheck, compressorStrategy } from "./middleware/compress.mjs";
import { corsLoose, corsStrict } from "./middleware/cors.mjs";

//npm modules
import express from "express";
import compression from "compression";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

const app = express();
const limiter = rateLimit({
  windowMs: config.optimization.RATE_LIMIT_WINDOWMS * 60 * 1000,
  max: config.optimization.RATE_LIMIT_MAX,
});

//Authorize HTTP request first to form req.user
app.use(
  cors({
    origin: { ...corsLoose.origin, ...corsStrict.origin },
    optionSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(httpLogger);
app.use(limiter);

//Compression
app.use(
  compression({
    level: config.optimization.COMPRESSION_LEVEL,
    threshold: config.optimization.COMPRESSION_THRESHOLD_LIMIT,
    chunkSize: config.optimization.COMPRESSION_CHUNKSIZE,
    memLevel: config.optimization.COMPRESSION_MEMLEVEL,
    windowBits: config.optimization.COMPRESSION_WINDOWBITS,
    strategy: compressorStrategy(),
    filter: compressorCheck(compression),
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(config.server.PORT, config.server.HOST, () => {
  logger.info(
    `Server Started and Listening on ${config.server.HOST}:${config.server.PORT} in a ${config.environment.NODE_ENV} environment.`
  );
});
