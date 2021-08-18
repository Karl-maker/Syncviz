export default {
  //Environment, Machine, Timezone etc:

  environment: {
    NODE_ENV: process.env.NODE_ENV || "development",
  },

  //Server API:

  server: {
    HOST: process.env.DEV_API_HOST || "localhost",
    PORT: process.env.DEV_API_PORT || 8080,
  },

  //Database and Storage:

  storage: {
    USER_FILES_PATH: process.env.DEV_USER_FILE_PATH || "./",
  },
};
