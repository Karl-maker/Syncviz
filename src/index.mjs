import logger from "./log/server-logger.mjs";
import { initialize } from "./server/server.mjs";
import config from "./config/config.mjs";
import express from "express";
import socket from "./connection/socket.mjs";
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

initialize(app, server, { express: express });

server.listen(config.server.PORT, config.server.HOST, () => {
  //192.168.0.__:PORT
  logger.info({
    message: `Server Started and Listening on ${server.address().address}:${
      server.address().port
    } in a ${config.environment.NODE_ENV} environment`,
    timestamp: `${new Date().toString()}`,
  });
});

socket(io);
