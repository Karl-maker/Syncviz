import dotenv from "dotenv";
import fs, { readFile } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

//------Utilities------------

const readENVFile = (location) => {
  return fs.readFileSync(path.resolve(__dirname, location), "utf8");
};

export default {
  //Server API:
  server: {
    PROTOCOL: process.env.DEV_PROTOCOL || "http",
    HOST: process.env.DEV_API_HOST || "0.0.0.0",
    PORT: process.env.DEV_API_PORT || 3000,
  },

  cache: {
    PORT: process.env.DEV_REDIS_PORT || 6379,
    HOST: process.env.DEV_REDIS_HOST || "127.0.0.1",
    URL: process.env.DEV_REDIS_URL || null,
  },

  redis_socket_adapter: {
    PORT: process.env.DEV_REDIS_SOCKET_ADAPTER_PORT || 6379,
    HOST: process.env.DEV_REDIS_SOCKET_ADAPTER_HOST || "127.0.0.1",
    URL: process.env.DEV_REDIS_SOCKET_ADAPTER_URL || null,
  },

  client: {
    //In terms of referencing from server
    PROTOCOL: process.env.DEV_PROTOCOL || "http",
    HOST: process.env.DEV_CLIENT_HOST || "192.168.0.13",
    PORT: process.env.DEV_CLIENT_PORT || 3000,
    CLIENT_LINK: process.env.DEV_CLIENT_LINK || "Syncviz.com",
  },

  optimization: {
    RATE_LIMIT_WINDOWMS: process.env.DEV_RATE_LIMIT_WINDOWMS || 15, //In minutes
    RATE_LIMIT_MAX: process.env.DEV_RATE_LIMIT_MAX || 100,
    COMPRESSION_LEVEL: process.env.DEV_COMPRESSION_LEVEL || 6,
    COMPRESSION_MEMLEVEL: process.env.DEV_COMPRESSION_MEMLEVEL || 8,
    COMPRESSION_CHUNKSIZE: process.env.DEV_COMPRESSION_CHUNKSIZE || 16384,
    COMPRESSION_WINDOWBITS: process.env.DEV_COMPRESSION_WINDOWBITS || 15,
    COMPRESSION_THRESHOLD_LIMIT:
      process.env.DEV_COMPRESSION_THRESHOLD_LIMIT || 0, //in bytes
  },

  //Debugging:
  debug: {
    LOG_FILE: process.env.DEV_LOG_FILE || "./logs/server.log", //Relative to Log folder in source
    LOG_MAXSIZE: process.env.DEV_LOG_MAXSIZE || 5242880, //5MB
    LOG_MAXFILES: process.env.DEV_LOG_MAXFILE || 5,
  },

  email: {
    SENDER_EMAIL_ADDRESS: process.env.DEV_SENDER_EMAIL_ADDRESS || "",
    SENDER_EMAIL_PASSWORD: process.env.DEV_SENDER_EMAIL_PASSWORD || "password",
    SENDER_EMAIL_SERVICE: process.env.DEV_SENDER_EMAIL_SERVICE || "Gmail",
  },

  //Database and Storage:
  storage: {
    USER_FILES_PATH: process.env.DEV_USER_FILE_PATH || "./", //From src folder
  },

  database: {
    DB_CONNECT: process.env.DEV_DB_CONNECT,
  },

  jwt: {
    ISSUER: process.env.DEV_ISSUER || "Syncviz Company",
    ALGORITHM: process.env.DEV_ALGORITHM || "RS256",
    IS_HTTPS: process.env.DEV_IS_HTTPS || false, //This is usually false
    REFRESH_TOKEN_LIFE: process.env.DEV_REFRESH_TOKEN_LIFE || 90,
    ACCESS_TOKEN_LIFE: process.env.DEV_ACCESS_TOKEN_LIFE || 10000,
    ACCESS_TOKEN_PUBLIC_KEY: readENVFile(
      process.env.DEV_ACCESS_TOKEN_PUBLIC_KEY ||
        `../../../keys/access-public.key`
    ),
    ACCESS_TOKEN_PRIVATE_KEY: readENVFile(
      process.env.DEV_ACCESS_TOKEN_PRIVATE_KEY ||
        "../../../keys/access-private.key"
    ),
    REFRESH_TOKEN_PUBLIC_KEY: readENVFile(
      process.env.DEV_REFRESH_TOKEN_PUBLIC_KEY ||
        "../../../keys/refresh-public.key"
    ),
    REFRESH_TOKEN_PRIVATE_KEY: readENVFile(
      process.env.DEV_REFRESH_TOKEN_PRIVATE_KEY ||
        "../../../keys/refresh-private.key"
    ),
  },
};
