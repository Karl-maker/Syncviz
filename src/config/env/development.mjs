export default {
  //Server API:
  server: {
    HOST: process.env.DEV_API_HOST || "localhost",
    PORT: process.env.DEV_API_PORT || 8080,
  },

  //Debugging:
  debug: {
    LOG_FILE: process.env.DEV_LOG_FILE || "./logs/server.log", //Relative to Log folder in source
    LOG_MAXSIZE: process.env.DEV_LOG_MAXSIZE || 5242880, //5MB
    LOG_MAXFILES: process.env.DEV_LOG_MAXFILE || 5,
  },

  //Database and Storage:
  storage: {
    USER_FILES_PATH: process.env.DEV_USER_FILE_PATH || "./", //From src folder
  },

  database: {
    SEQUELIZE_CONNECT: process.env.DEV_SEQUELIZE_CONNECT,
  },
};
