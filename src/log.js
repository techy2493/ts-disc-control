import config from "./config.js";
import _ from "lodash";
import fs from "fs";

class log {
  LOG_LEVEL = {
    SYSTEM: 0,
    ERROR: 1,
    WARN: 3,
    INFO: 7,
    DEBUG: 15,
    VERBOSE: 31,
  };

  LOG_STR = _.invert(this.LOG_LEVEL);

  constructor() {}

  addLog(level, message, data) {
    if (config.logLevel & level) return;
    this.logConsole(level, message, data);
  }

  getTimeStamp() {
    return new Date().toISOString();
  }

  compileMessage(message, data) {
    if (data) {
      _.keysIn(data).forEach((key) => {
        let data =
          data[key] instanceof Object ? JSON.stringify(data[key]) : data[key];
        message = message.replace(`\$${key}`, `${key}: ${data}`);
      });
    }
    return message;
  }

  createLogString(level, message, data) {
    return `${this.getTimeStamp()} - [${
      this.LOG_STR[level]
    }] - ${this.compileMessage(message, data)}`;
  }

  logConsole(level, message, data) {
    console.log(this.createLogString(level, message, data));
  }

  logFile(level, message, data) {
    if (config.logging.file === undefined) return;
    fs.appendFileSync(
      config.logging.file,
      this.createLogString(level, message, data),
      data
    );
  }

  system(message, data) {
    this.addLog(this.LOG_LEVEL.SYSTEM, message, data);
  }

  error(message, data) {
    this.addLog(this.LOG_LEVEL.ERROR, message, data);
  }

  info(message, data) {
    this.addLog(this.LOG_LEVEL.INFO, message, data);
  }

  debug(message, data) {
    this.addLog(this.LOG_LEVEL.DEBUG, message, data);
  }

  verbose(message, data) {
    this.addLog(this.LOG_LEVEL.VERBOSE, message, data);
  }
}

export default Object.freeze(new log());
