import redis from "redis";
import config from "../config/config.mjs";
import logger from "../log/server-logger.mjs";

//............CONFIG....................

export const client = redis.createClient({
  port: config.cache.PORT,
  host: config.cache.HOST,
  url: config.cache.URL || null,
});

client.on("error", (error) => {
  logger.error({
    message: error,
    timestamp: `${new Date().toString()}`,
  });
});

client.on("end", () => {
  logger.info({
    message: "Redis Connection Lost",
    timestamp: `${new Date().toString()}`,
  });
});

client.on("reconnecting", ({ delay, attempt }) => {
  logger.warning({
    message: "Redis Reconnecting ",
    delay: delay,
    attemps: attempt,
    timestamp: `${new Date().toString()}`,
  });
});

/*
cli

redis-server
*/
