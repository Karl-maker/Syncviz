import logger from "../log/server-logger.mjs";

export default (io) => {
  //Basic Connection

  io.on("connection", (socket) => {
    //console.log("Connection Established ID:" + socket.id);
    logger.info({
      message: "Connection Established " + socket.id,
      timestamp: new Date().toString(),
    });
  });
};
