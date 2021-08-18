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

const defaults = {
  environemnt: { NODE_ENV: env },
};

const config = {
  development: extend(development, defaults),
  test: extend(test, defaults),
  production: extend(production, defaults),
};

export default config[env];
