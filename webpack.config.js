const path = require("path");
module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/index.js",
  },
  node:{
    fs:'empty'
  },
  module: {
    rules: [
    ],
  },
};
