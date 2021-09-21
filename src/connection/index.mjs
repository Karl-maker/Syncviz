import logger from "../log/server-logger.mjs";
import { authorizeIo } from "../middleware/authorization.mjs";
import protectScene from "./scene/scene-protect.mjs";

export default (io) => {
  var user = {};
  var ip;
  const liveScene = io.of("/live-scene");

  //Authorize Connection and Protect it
  liveScene.use(async (socket, next) => {
    await authorizeIo(socket.request, next);
    await protectScene(socket, next);

    socket.on("message", (data) => {
      socket
        .in(socket.request.query.id)
        .emit("message", { message: `${data.message}` });
    });

    socket.on("disconnect", (data) => {
      socket
        .in(socket.request.query.id)
        .emit("message", { message: `User Left Scene` });

      logger.info({
        user: socket.request.user.username,
        ip:
          (socket.request.headers["x-forwarded-for"] || "")
            .split(",")
            .pop()
            .trim() || socket.request.socket.remoteAddress,
        connected: socket.status,
        message: "Disconnected",
        scene: socket.request.query.id,
        timestamp: new Date().toString(),
      });
    });
  });
};
