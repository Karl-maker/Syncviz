import logger from "../../log/server-logger.mjs";
import { authorizeIo } from "../../middleware/authorization.mjs";
import sceneService from "../../routes/services/scene-service.mjs";

export default async (socket, next) => {
  socket.request.query = {
    id: socket.handshake.query.scene || null,
    passcode: socket.handshake.query.passcode || "",
  };

  var user = socket.request.user || {
    username: "guest",
  };

  var ip =
    (socket.request.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    socket.request.socket.remoteAddress;

  logger.info({
    user: user.username,
    ip: ip,
    connected: socket.status,
    message: "Request",
    scene: socket.request.query.id,
    timestamp: new Date().toString(),
  });

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

  await socket.join(socket.request.query.id);
  logger.info({
    user: user.username,
    ip: ip,
    connected: socket.status,
    message: "Join",
    scene: socket.request.query.id,
    timestamp: new Date().toString(),
  });

  next();
};
