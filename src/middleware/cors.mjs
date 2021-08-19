//Third Parties
export const corsLoose = {
  origin: "*",
  //origin: function (origin, callback) {
  // db.loadOrigins is an example call to load
  // a list of origins from a backing database
  //db.loadOrigins(function (error, origins) {
  //callback(error, origins)
  //})
  //}
};

//Syncviz devices
export const corsStrict = {
  optionsSuccessStatus: 200,
  origin: "*",
  //origin: function (origin, callback) {
  // db.loadOrigins is an example call to load
  // a list of origins from a backing database
  //db.loadOrigins(function (error, origins) {
  //callback(error, origins)
  //})
  //}
};
