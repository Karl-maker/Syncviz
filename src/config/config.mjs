/*
Author: Karl-Johan Bailey 17/08/2021

This file must controll configuration throughout the app.
*/

//Main ENV Variables

export const NODE_ENV = process.env.NODE_ENV || "development";
export const HOST = process.env.HOST || "localhost";
export const PORT = process.env.PORT || 8080;

//Database and Storage:

export const USER_FILES_PATH = process.env.USER_FILES_PATH || "./";
