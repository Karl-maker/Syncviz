import cluster from "cluster";
import os from "os";
import http from "http";
import express from "express";
import { createClient } from "redis";
import { Server } from "socket.io";
import { setupMaster, setupWorker } from "@socket.io/sticky";
import {
  createAdapter as createClusterAdapter,
  setupPrimary,
} from "@socket.io/cluster-adapter";
import { createAdapter as createRedisAdapter } from "@socket.io/redis-adapter";
import cors from "cors";

//---------------------------------------------------
import logger from "./log/server-logger.mjs";
import { initialize } from "./server/server.mjs";
import config from "./config/config.mjs";
import socket from "./connection/index.mjs";
import { connectDB } from "./helpers/db.mjs";

const totalCPUs = os.cpus().length;
const app = express();

const pubClient = createClient({
  host: config.redis_socket_adapter.PORT,
  host: config.redis_socket_adapter.HOST,
  url: config.redis_socket_adapter.URL || null,
});
const subClient = pubClient.duplicate();

//--------REDIS--------------------------------------

if (cluster.isMaster) {
  logger.info({
    message: `Number of CPUs is ${totalCPUs}`,
    timestamp: new Date().toString(),
  });
  logger.info({
    message: `Master ${process.pid} is running`,
    timestamp: new Date().toString(),
  });

  const server = http.createServer();

  // setup sticky sessions
  setupMaster(server, {
    loadBalancingMethod: "least-connection",
  });

  // setup connections between the workers
  setupPrimary();

  // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
  // Node.js < 16.0.0
  cluster.setupMaster({
    serialization: "advanced",
  });

  //-----------------------------------Socket------------------------------------
  server.listen(Number(config.server.PORT) + 50, config.server.HOST, () => {
    //192.168.0.__:PORT
    logger.info({
      message: `Socket Started and Listening on ${server.address().address}:${
        server.address().port
      } in a ${config.environment.NODE_ENV} environment`,
      timestamp: `${new Date().toString()}`,
    });
  });

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    logger.error({
      message: `worker ${worker.process.pid} died`,
      timestamp: new Date().toString(),
    });

    logger.error({
      message: "Let's fork another worker!",
      timestamp: new Date().toString(),
    });

    cluster.fork();
  });
} else {
  const server = http.createServer();
  const io = new Server(
    server,
    { cors: { origin: "*" } },
    { path: "/live-scene" }
  );

  logger.info({
    message: `Worker ${process.pid} started`,
    timestamp: `${new Date().toString()}`,
  });

  //----------------------------------------ADAPTERS-------------------------------------------------
  // use the cluster adapter
  io.adapter(createClusterAdapter());

  //Redis adapter
  io.adapter(createRedisAdapter(pubClient, subClient));

  // setup connection with the primary process
  setupWorker(io);

  //------------------------------------INITIALIZE--------------------------------------------------

  //Database
  connectDB();

  //-----------------------------------HTTP-------------------------------------
  app.listen(config.server.PORT, config.server.HOST, () => {
    //192.168.0.__:PORT
    logger.info({
      message: `HTTP Server Started and Listening on ${config.server.HOST}:${config.server.PORT} in a ${config.environment.NODE_ENV} environment`,
      timestamp: `${new Date().toString()}`,
    });
  });

  socket(io);
  initialize(app, { express: express });
}
