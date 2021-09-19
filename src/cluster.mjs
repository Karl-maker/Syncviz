import cluster from "cluster";
import os from "os";
import { createServer } from "http";
import express from "express";
import ioRedis from "socket.io-redis";
import { Server } from "socket.io";
import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";

//---------------------------------------------------
import logger from "./log/server-logger.mjs";
import { initialize } from "./server/server.mjs";
import config from "./config/config.mjs";
import socket from "./connection/socket.mjs";

const totalCPUs = os.cpus().length;
const app = express();

if (cluster.isMaster) {
  logger.info({
    message: `Number of CPUs is ${totalCPUs}`,
    timestamp: new Date().toString(),
  });
  logger.info({
    message: `Master ${process.pid} is running`,
    timestamp: new Date().toString(),
  });

  const server = createServer(app);

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

  server.listen(config.server.PORT, config.server.HOST, () => {
    //192.168.0.__:PORT
    logger.info({
      message: `Server Started and Listening on ${server.address().address}:${
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
  const server = createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  //----------------------------------------ADAPTERS-------------------------------------------------

  io.adapter(
    ioRedis({
      host: config.redis_socket_adapter.PORT,
      host: config.redis_socket_adapter.HOST,
      url: config.redis_socket_adapter.URL || null,
    })
  );

  // use the cluster adapter
  io.adapter(createAdapter());

  // setup connection with the primary process
  setupWorker(io);

  socket(io);

  initialize(app, server, { express: express });
}
