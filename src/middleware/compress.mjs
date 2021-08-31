import zlib from "zlib";
import compression from "compression";
import logger from "../log/server-logger.mjs";
import { timeStamp } from "console";

function compressorCheck(compression) {
  //inject import
  return function dataCompress(req, res) {
    if (req.headers["x-no-compression"]) {
      // don't compress responses with this request header
      return false;
    }
    // fallback to standard filter function
    return compression.filter(req, res);
  };
}

function compressorStrategy(contentType) {
  //Compress customize based on type of req. https://www.npmjs.com/package/compression
  //If it's JSON exit ASAP to not spend time here
  let strategy;

  switch (contentType) {
    case "DEFAULT":
      strategy = zlib.Z_DEFAULT_STRATEGY;
      break;
    case "RLE":
      strategy = zlib.Z_RLE;
      break;
    case "FILTERED":
      strategy = zlib.Z_FILTERED;
      break;
    case "FIXED":
      strategy = zlib.Z_FIXED;
      break;
    case "HUFFMAN":
      strategy = zlib.Z_HUFFMAN_ONLY;
      break;
    default:
      strategy = zlib.Z_DEFAULT_STRATEGY;
      break;
  }
  return strategy;
}

//Compression

export function compressRouter({
  config,
  level,
  threshold,
  chunkSize,
  memLevel,
  windowBits,
  contentType,
}) {
  contentType = typeof contentType !== undefined ? contentType : "DEFAULT";
  let strategy = compressorStrategy(contentType);
  logger.debug({
    message: `Compress HTTP (req, res) with ${contentType} compressor.`,
    timestamp: `${new Date().toString()}`,
  });

  return compression({
    level:
      typeof level !== undefined
        ? level
        : config.optimization.COMPRESSION_LEVEL,
    threshold:
      typeof threshold !== undefined
        ? threshold
        : config.optimization.COMPRESSION_THRESHOLD_LIMIT,
    chunkSize:
      typeof chunkSize !== undefined
        ? chunkSize
        : config.optimization.COMPRESSION_CHUNKSIZE,
    memLevel:
      typeof memLevel !== undefined
        ? memLevel
        : config.optimization.COMPRESSION_MEMLEVEL,
    windowBits:
      typeof windowBits !== undefined
        ? windowBits
        : config.optimization.COMPRESSION_WINDOWBITS,
    strategy: strategy,
    filter: compressorCheck(compression),
  });
}
