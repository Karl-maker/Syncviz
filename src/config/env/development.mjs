export default {
  //Environment, Machine, Timezone etc:

  ENVIRONMENT: {
    NODE_ENV: process.env.NODE_ENV || "development",
  },

  //Server API:

  SERVER: {
    HOST: process.env.DEV_API_HOST || "localhost",
    PORT: process.env.DEV_API_PORT || 8080,
  },

  //Database and Storage:

  STORAGE: {
    USER_FILES_PATH: process.env.DEV_USER_FILE_PATH || "./",
  },
};
