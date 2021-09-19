import logger from "./log/server-logger.mjs";
import { initialize } from "./server/server.mjs";
import config from "./config/config.mjs";
import express from "express";
import { Server } from "socket.io";
import ioRedis from "socket.io-redis";
import { createServer } from "http";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
io.adapter(
  ioRedis({
    host: config.redis_socket_adapter.PORT,
    host: config.redis_socket_adapter.HOST,
    url: config.redis_socket_adapter.URL || null,
  })
);

//----START-----

initialize(app, server, { express: express, io: io });
