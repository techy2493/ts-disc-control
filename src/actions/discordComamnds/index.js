const tsid = require("./register");
const sync = require("./sync");
const unsync = require("./unsync");
const syncRole = require("./syncRole");

const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const commandsPath = path.join(__dirname, "./");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js") && !file.endsWith("index.js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  console.log("Loading Discord Command", command.data.name);
  commands.push(command);
}
module.exports = commands;
