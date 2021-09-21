import { setInternalBufferSize } from "bson";
import { io } from "socket.io-client";
import logger from "../log/server-logger.mjs";
import { authorizeIo } from "../middleware/authorization.mjs";
import sceneService from "../routes/services/scene-service.mjs";

export default (io) => {
  var user = {};
  var ip;
  const liveScene = io.of("/live-scene");

  //Authorize Connection and Protect it
  liveScene.use(async (socket, next) => {
    await authorizeIo(socket.request, next);

    //----------------------------------------------------------

    socket.request.query = {
      id: socket.handshake.query.scene || null,
      passcode: socket.handshake.query.passcode || "",
    };

    user = socket.request.user || {
      username: "guest",
    };

    ip =
      (socket.request.headers["x-forwarded-for"] || "")
        .split(",")
        .pop()
        .trim() || socket.request.socket.remoteAddress;

    //-----------------------------CHECK-----------------------

    logger.info({
      user: user.username,
      ip: ip,
      connected: socket.status,
      message: "Request Scene Connection",
      scene: socket.request.query.id,
      timestamp: new Date().toString(),
    });

    //----------------------------------------------------------

    const isAllowedJoin = await sceneService
      .getById(socket.request)
      .then((scene) => {
        logger.info({
          user: user.username,
          ip: ip,
          connected: socket.status,
          message: "Authorized",
          scene: socket.request.query.id,
          timestamp: new Date().toString(),
        });
        return true;
      })
      .catch((err) => {
        logger.info({
          user: user.username,
          ip: ip,
          connected: socket.status,
          message: "Unauthorized",
          scene: socket.request.query.id,
          timestamp: new Date().toString(),
        });
        return false;
      });

    if (!isAllowedJoin) {
      socket.disconnect();
      next(err);
    }

    //---------------JOIN ROOM------------------------

    await socket.join(socket.request.query.id);
    logger.info({
      user: user.username,
      ip: ip,
      connected: socket.status,
      message: "Join Scene",
      scene: socket.request.query.id,
      timestamp: new Date().toString(),
    });

    //Message

    socket.on("message", (data) => {
      socket
        .in(socket.request.query.id)
        .emit("message", { message: `${data.message}` });
    });

    socket.on("disconnect", (data) => {
      socket
        .in(socket.request.query.id)
        .emit("message", { message: `User Left Scene` });
    });
  });
};
