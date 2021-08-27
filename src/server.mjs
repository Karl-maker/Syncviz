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
import { corsOrigins } from "./middleware/cors.mjs";
import appRoutes from "./routes/index.mjs";

//npm modules
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

//utilites
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
    origin: corsOrigins,
    optionSuccessStatus: 200,
  })
);

//API Routes
app.use("/api", appRoutes);

//Legal && Other Routes:

//MERN Stack React.js Frontend App:
if (config.environment.NODE_ENV === "production") {
  app.use(express.static(config.environment.REACT_BUILD_PATH));

  const INDEX_PATH = path.join(
    __dirname,
    config.environment.REACT_BUILD_PATH,
    config.environment.REACT_BUILD_INDEX
  );

  app.get("*", (req, res) => {
    res.sendFile(INDEX_PATH);
  });
}

app.listen(config.server.PORT, config.server.HOST, () => {
  logger.info({
    message: `Server Started and Listening on ${config.server.HOST}:${config.server.PORT} in a ${config.environment.NODE_ENV} environment`,
    timestamp: `${new Date().toString()}`,
  });
});
