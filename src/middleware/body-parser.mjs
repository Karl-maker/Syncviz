import bodyParser from "body-parser";

// create application/json parser
export const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
export const urlencodedParser = bodyParser.urlencoded({ extended: false });
