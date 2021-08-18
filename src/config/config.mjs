/*
Author: Karl-Johan Bailey 17/08/2021

This file must controll configuration throughout the app with environment awareness.
*/

import util from "util";
import test from "./env/test.mjs";
import development from "./env/development.mjs";
import production from "./env/production.mjs";

const extend = util._extend;
const env = process.env.NODE_ENV || "development";
const defaults = {
  environment: { NODE_ENV: env },
};
const config = {
  test: { ...test, ...defaults },
  development: { ...development, ...defaults },
  production: { ...production, ...defaults },
};

export default config[env];
