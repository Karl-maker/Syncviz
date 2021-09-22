import logger from "../log/server-logger.mjs";
import { authorizeIo } from "../middleware/authorization.mjs";
import protectScene from "./scene/scene-protect.mjs";
import config from "../config/config.mjs";

export default (io) => {
  var user = {};
  var ip;
  const liveScene = io.of("/live-scene");

  //Authorize Connection and Protect it
  liveScene.use(async (socket, next) => {
    await authorizeIo(socket.request, next);
    await protectScene(socket, next);

    socket.on("message", (data) => {
      socket.in(socket.request.query.id).emit("message", {
        message: `${data.message}`,
        date: `${new Date().getDay()}/${new Date().getMonth()}/${new Date().getFullYear()}`,
        time: `${new Date()
          .toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          .toString()}`,
        user: socket.request.user.username,
        connection_id: socket.id,
      });
    });

    socket.on("position", (data) => {
      socket.in(socket.request.query.id).emit("position", {
        location: {
          x: data.location.x,
          y: data.location.y,
          z: data.location.z,
        },
        rotation: {
          x: data.rotation.x,
          y: data.rotation.y,
          z: data.rotation.z,
        },
        user: socket.request.user.username,
        connection_id: socket.id,
      });
    });

    socket.on("typing", (data) => {
      socket.in(socket.request.query.id).emit("typing", {
        is_typing: true,
        user: socket.request.user.username,
        connection_id: socket.id,
      });
    });

    socket.on("connect", (data) => {
      socket.in(socket.request.query.id).emit("prompt", {
        message: `${socket.request.user.username} Joined`,
        date: `${new Date().getDay()}/${new Date().getMonth()}/${new Date().getFullYear()}`,
        time: `${new Date()
          .toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          .toString()}`,
        user: socket.request.user.username,
        connection_id: socket.id,
      });
    });

    socket.on("3d-file", async (data) => {
      const file = await new Buffer(data).toString("base64");
      socket.in(socket.request.query.id).emit("3d-file", file);
    });

    socket.on("disconnect", (data) => {
      socket.in(socket.request.query.id).emit("prompt", {
        message: `${socket.request.user.username} Left`,
        date: `${new Date().getDay()}/${new Date().getMonth()}/${new Date().getFullYear()}`,
        time: `${new Date()
          .toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          .toString()}`,
        user: socket.request.user.username,
        connection_id: socket.id,
      });

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
