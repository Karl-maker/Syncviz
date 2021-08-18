/*
Author: Karl-Johan Bailey 17/08/2021

This file must controll configuration throughout the app with environment awareness.
*/

import util from "util";
import development from "./env/development.mjs";
import test from "./env/test.mjs";
import production from "./env/production.mjs";

const extend = util._extend;
const env = process.env.NODE_ENV || "development";

const config = {
  development: development,
  test: test,
  production: production,
};

export default config[env];
