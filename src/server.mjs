/*
Author: Karl-Johan Bailey 17/08/2021

This file will:
1. create a server using restify module
2. use a index file from the middleware modules in one line of code
3. listen on port specified by config.mjs file within config folder
*/

import restify from "restify";
import config from "./config/config.mjs";

function respond(req, res, next) {
  res.send("hello " + req.params.name);
  next();
}

var server = restify.createServer();
//Routes Go Here
server.get("/hello/:name", respond);
server.head("/hello/:name", respond);

server.listen(config.SERVER.PORT, config.SERVER.HOST, function () {
  console.log(
    "Syncviz",
    config.ENVIRONMENT.NODE_ENV,
    "environment RESTful API listening on:",
    server.url
  );
});
