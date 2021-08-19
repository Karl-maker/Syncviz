import zlib from "zlib";

export function compressorCheck(compression) {
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

export function compressorStrategy(req, res) {
  //Compress customize based on type of req. https://www.npmjs.com/package/compression
  //If it's JSON exit ASAP to not spend time here

  return zlib.Z_DEFAULT_STRATEGY;
}
