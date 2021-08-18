import morgan from "morgan";
import json from "morgan-json";
import logger from "./serverLogger.mjs";

//Setup Tokens

morgan.token(
  "ip",
  (req) => req.headers["x-forwarded-for"] || req.connection.remoteAddress
);
morgan.token("user", (req) => {
  if (req.user) {
    return req.user.username;
  }
  return "no user data";
});

//Logger format

const format = json({
  method: ":method",
  url: ":url",
  status: ":status",
  ip: ":ip",
  user: ":user",
  contentLength: ":res[content-length]",
  responseTime: ":response-time",
});

const httpLogger = morgan(format, {
  stream: {
    write: (message) => {
      const { method, url, status, ip, user, contentLength, responseTime } =
        JSON.parse(message);

      logger.info("HTTP Access Log", {
        ip,
        user,
        timestamp: new Date().toString(),
        method,
        url,
        status: Number(status),
        contentLength,
        responseTime: Number(responseTime),
      });
    },
  },
});

export default httpLogger;
