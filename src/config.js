import path from "path";
import nconf from "nconf";
import fs from "fs";
import _ from "lodash";
import { flatten } from "flat";

function loadConfig() {
  let filepath = path.join(process.cwd(), "config.json");
  let env = process.env.NODE_ENV || "development";

  // Command-line arguments
  nconf.argv();

  // Environment variables
  nconf.env();

  // Environment specific configuration file
  var parts = filepath.split(".");

  parts.splice(parts.length - 1, 0, env);

  var defaults = {
    sqlite: {
      filename: "database.sqlite",
    },
    discord: {
      token: "CHANGEME",
      guild: "CHANGEME",
      clientID: "CHANGEME",
      clientSecret: "CHANGEME",
      useOAuth: true,
    },
    teamspeak: {
      host: "CHANGEME",
      queryport: 10011,
      virtualServerId: "CHANGEME",
      username: "CHANGEME",
      password: "CHANGEME",
      welcomeMessageText: null,
      usePokes: true,
    },
    web: {
      port: 8090,
      baseUrl: "CHANGEME",
      clientBaseUrl: "CHANGEME",
      oAuthRedirect: "/redirect",
      loginUrl: "CHANGEME",
    },
    logging: {
      level: "ERROR",
      file: "bot.log",
    },
    bot: {
      master: "discord",
    },
  };

  nconf.file(filepath);

  if (!fs.existsSync(filepath)) {
    console.error("Config file not found at " + filepath);
    console.error("Writing default config to " + filepath);
    console.error("Please edit the file and restart the bot.");
    fs.writeFileSync(filepath, JSON.stringify(defaults, null, 2));
    process.exit(1);
  }

  // Set required defaults
  config = _.defaultsDeep(config, defaults);

  var config = nconf.get();
  var flat = flatten(config);
  var missingKeyFound = false;
  _.forEach(flat, (value, key) => {
    if (value === "CHANGEME") {
      console.error(
        `Please change the value of ${key} in ${filepath} and restart the bot.`
      );
      missingKeyFound = true;
    }
  });

  if (missingKeyFound) process.exit(1);

  return config;
}

export default Object.freeze(loadConfig());
