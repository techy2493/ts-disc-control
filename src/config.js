module.exports = (() => {
  let config = require("config.json")("./config.json");
  config.bot = { master: "discord" };
  return config;
})();
