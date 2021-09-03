import logger from "../log/server-logger.mjs";
import errorFormatter from "../utilities/error-formatter.mjs";

export default errorHandler;

function errorHandler(err, req, res, next) {
  try {
    switch (true) {
      case err.name === "NoToken":
        //No jwt token
        logger.debug({
          message: err.message,
          timestamp: new Date().toString(),
        });
        return res.status(403).json({ message: "Unauthorized" });
      case err.name === "UnauthorizedError":
        // jwt authentication error
        logger.debug({
          message: err.message,
          timestamp: new Date().toString(),
        });
        return res.status(401).json({ message: "Unauthorized" });
      case err.name === "NotFound":
        //404 Errors
        logger.debug({
          message: err.message,
          timestamp: new Date().toString(),
        });
        return res.status(404).json({ message: err.message });
      case err.name === "NotConfirmed":
        //401 Errors
        logger.debug({
          message: err.message,
          timestamp: new Date().toString(),
        });
        return res.status(401).json({ message: err.message });
      case err.name === "BadRequest":
        //400 Errors
        logger.debug({
          message: err.message,
          timestamp: new Date().toString(),
        });
        return res.status(400).json({ message: err.message });
      case err.name === "AlreadyExist":
        //402 Errors
        logger.debug({
          message: err.message,
          timestamp: new Date().toString(),
        });
        return res.status(402).json({ message: err.message });
      case err.name === "ValidationError":
        //400 Errors
        return res.status(400).json({
          message: {
            prompt: "Validation Error",
            field: err.message,
          },
        });
      case err.message.includes("validation failed"):
        //400 Errors
        return res.status(400).json({
          message: {
            prompt: "Validation Error",
            field: errorFormatter(err.message),
          },
        });
      default:
        logger.error({
          message: err.message,
          timestamp: new Date().toString(),
        });
        return res.status(500).json({ message: "Unexpected Error" });
    }
  } catch (e) {
    logger.error({
      message: e,
      timestamp: new Date().toString(),
    });
    return res.status(500).json({ message: "Unexpected Error" });
  }
}
