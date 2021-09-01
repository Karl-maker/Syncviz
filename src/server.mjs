/*
Author: Karl-Johan Bailey 17/08/2021

This file will:
1. create a server using restify module
2. use a index file from the middleware modules in one line of code
3. listen on port specified by config.mjs file within config folder

Link to Documentation: https://docs.google.com/document/d/12gGP0TI1YUMk8Vb679H9wEROh_HRRtSpU3-IzjISQ6M/edit#
*/

import config from "./config/config.mjs";
import logger from "./log/server-logger.mjs";
import httpLogger from "./log/http-logger.mjs";
import { corsOrigins } from "./middleware/cors.mjs";
import { compressRouter } from "./middleware/compress.mjs";
import appRoutes from "./routes/index.mjs";
import { connectDB } from "./helpers/db.mjs";
import { jsonParser, urlencodedParser } from "./middleware/body-parser.mjs";
import errorHandler from "./middleware/error-handler.mjs";

//npm modules
import express from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
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

//Database
connectDB();

//Middleware
// GZIP all assets
app.use((req, res, next) => {
  //depending on content type switch contentType
  compressRouter({ config: config, contentType: "DEFAULT" });
  next();
});

app.use(httpLogger);
app.use(helmet());
app.use(limiter);
app.use(urlencodedParser);
app.use(jsonParser);
app.use(cookieParser());
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

app.use(errorHandler);

app.listen(config.server.PORT, config.server.HOST, () => {
  logger.info({
    message: `Server Started and Listening on ${config.server.HOST}:${config.server.PORT} in a ${config.environment.NODE_ENV} environment`,
    timestamp: `${new Date().toString()}`,
  });
});
