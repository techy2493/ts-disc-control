const config = require("./config");
const sqlite3 = require("sqlite3").verbose();

class Database {
  constructor() {
    this.db = new sqlite3.Database(
      config.sqlite.filename ? config.sqlite.filename : "database.sqlite3"
    );
    return this;
  }

  async initializeDatabase() {
    return new Promise(async (resolve, reject) => {
      try {
        var tables = await this.executeQuery(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='members';`
        );
        if (!tables || !tables[0] || tables[0].name !== "members") {
          await this.createDatabase();
        }

        await this.upgradeDatabase();
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  async createDatabase() {
    await this.executeNonQuery(
      `CREATE TABLE IF NOT EXISTS members (
            id integer PRIMARY KEY AUTOINCREMENT,
            discordID text NOT NULL,
            teamspeakID text NOT NULL UNIQUE)`
    );
    await this.executeNonQuery(`CREATE TABLE IF NOT EXISTS roles (
                      id integer PRIMARY KEY AUTOINCREMENT,
                      discordName text NOT NULL UNIQUE,
                      teamspeakName text NOT NULL UNIQUE
                  )`);
    await this.executeNonQuery(`CREATE TABLE IF NOT EXISTS settings (
                      id integer PRIMARY KEY AUTOINCREMENT,
                      key text NOT NULL UNIQUE,
                      value text NOT NULL)`);
    await this.executeNonQuery(
      'INSERT INTO settings (key, value) VALUES ("version", "4")'
    );
  }

  async upgradeDatabase() {
    return new Promise(async (resolve, reject) => {
      if ((await this.getVersion()) < 4) {
        await this.updateToV4();
        return resolve(false);
      }
      return resolve(true);
    });
  }

  async getVersion() {
    return new Promise(async (resolve, reject) => {
      var tables = await this.executeQuery(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='settings';`
      );
      if (tables && (tables.length < 1 || tables[0].name !== "settings")) {
        return resolve(0);
      }
      var version = await this.executeQuery(
        "SELECT value FROM settings WHERE key = 'version'"
      );
      if (version && version[0] && version[0].value) {
        return resolve(version[0].value);
      }
    });
  }

  async updateToV4() {
    var success = true;
    var command = 0;

    var commands = [
      // Backup
      `CREATE TABLE roles_backup_v3 as SELECT * FROM roles;`,
      `CREATE TABLE members_backup_v3 as SELECT * FROM members;`,

      // Migrate Members
      `DROP TABLE members;`,
      `CREATE TABLE IF NOT EXISTS members (
              id integer PRIMARY KEY AUTOINCREMENT,
              discordID text NOT NULL,
              teamspeakID text NOT NULL UNIQUE)`,
      `INSERT INTO members SELECT * FROM members_backup_v3;`,

      // Migrate roles
      `DROP TABLE roles;`,
      `CREATE TABLE IF NOT EXISTS roles (
                      id integer PRIMARY KEY AUTOINCREMENT,
                      discordName text NOT NULL UNIQUE,
                      teamspeakName text NOT NULL UNIQUE
                  )`,
      `INSERT INTO roles SELECT *, discordName FROM roles_backup_v3;`,

      // Create Settings
      `CREATE TABLE IF NOT EXISTS settings (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    key text NOT NULL UNIQUE,
                    value text NOT NULL)`,
      'INSERT INTO settings (key, value) VALUES ("version", "4")',
    ];

    while (success && command < commands.length) {
      await this.executeNonQuery(commands[command]);
      ++command;
    }
  }

  executeQuery(sql) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.all(sql, (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        });
      });
    });
  }

  executeNonQuery(sql) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(sql, (err) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      });
    });
  }

  async addTeamspeakID(discordID, tsID) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO members (discordID, teamspeakID)
                       VALUES ('${discordID}','${tsID}')`,
        (err) => {
          if (err) {
            console.log(err);
            reject(err);
          }
          resolve();
        }
      );
    });
  }

  async getSynchronizedRoles() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT id, discordName, teamspeakName FROM roles`,
        (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(
            rows.map((r) => {
              return {
                id: r.id,
                discord: r.discordName,
                teamspeak: r.teamspeakName,
              };
            })
          );
        }
      );
    });
  }

  async addSynchronizedRoles(discordRole, teamspeakGroup) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR IGNORE INTO roles (discordName, teamspeakName)
                         VALUES ('${discordRole}', '${teamspeakGroup}')`,
        (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  }

  async removeSynchronizedRoles(role) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM roles
                         WHERE discordName =  '${role}'`,
        (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  }

  async getTeamspeakIDByDiscordId(id) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT teamspeakID from members WHERE discordID = ?",
        [id],
        (err, rows) => {
          if (err) {
            reject(err);
          }
          var ids = [];
          if (rows) {
            rows.forEach((r) => {
              ids.push(r.teamspeakID);
            });
          }
          return resolve(ids);
        }
      );
    });
  }

  async getDiscodIDByTeamspeakID(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT discordID from members WHERE teamspeakID = ?",
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          }
          if (row) {
            resolve(row.discordID);
          } else {
            resolve(undefined);
          }
        }
      );
    });
  }
}

module.exports = new Database();
