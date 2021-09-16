import cluster from "cluster";
import os from "os";
//---------------------------------------------------
import logger from "./log/server-logger.mjs";
import { initialize } from "./server.mjs";

const totalCPUs = os.cpus().length;

if (cluster.isMaster) {
  logger.info({
    message: `Number of CPUs is ${totalCPUs}`,
    timestamp: new Date().toString(),
  });
  logger.info({
    message: `Master ${process.pid} is running`,
    timestamp: new Date().toString(),
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
  initialize();
}
