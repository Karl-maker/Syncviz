import { io } from "socket.io-client";
import logger from "../log/server-logger.mjs";
import { authorizeIo } from "../middleware/authorization.mjs";

// const orderNamespace = io.of("/orders");

// orderNamespace.on("connection", (socket) => {
//   socket.join("room1");
//   orderNamespace.to("room1").emit("hello");
// });

export default (io) => {
  //Basic Connection

  const scene_namespace = io.of("/scene");

  io.on("connection", async (socket) => {
    var user = {};
    var ip =
      (socket.request.headers["x-forwarded-for"] || "")
        .split(",")
        .pop()
        .trim() || socket.request.socket.remoteAddress;

    //Authorize

    io.use(async (socket, next) => {
      await authorizeIo(socket.request, next);

      user = socket.request.user || {
        username: "guest",
      };

      logger.info({
        user: user.username,
        ip: ip,
        message: "connected",
        timestamp: new Date().toString(),
      });

      //-----------EVENTS-----------------------------------------------
      socket.on("disconnect", () => {
        logger.info({
          user: user.username,
          ip: ip,
          message: "disconnected",
          timestamp: new Date().toString(),
        });
      });
    });
  });
};
