const config = require('./config');
const sqlite3 = require('sqlite3').verbose();

class Database {
    
    constructor() {
        this.db = new sqlite3.Database(config.database.sqlite.filename)
    }

    async initializeDatabase() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(`
                CREATE TABLE IF NOT EXISTS members (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    discordID text NOT NULL UNIQUE,
                    teamspeakID text)`, (err) => {
                        if (err) {
                            reject(err)
                        }
                    });
                this.db.run(`
                CREATE TABLE IF NOT EXISTS roles (
                    id integer PRIMARY KEY AUTOINCREMENT,
                    discordName text NOT NULL UNIQUE
                )
                `, (err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve()
                })
            });
        });
    }

    async updateTeamspeakID(discordID, tsID){
        //console.log('inserting ', discordID, tsID)
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO members (discordID, teamspeakID)
                       VALUES ('${discordID}','${tsID}')
                       ON CONFLICT(discordID) DO UPDATE SET
                        teamspeakID = excluded.teamspeakID`, (err) => {
                            if (err){
                                console.log(err)
                                reject(err);
                            }
                            resolve();
                        })
        })
    }

    async getSynchronizedRoles() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT discordName FROM roles`, (err, roles) => {
                if (err) {
                    reject(err)
                }
                resolve(roles.map(r => r.discordName))
            })
        })
    }

    async setSynchronizedRoles(roles) {
        console.log(`INSERT INTO roles (discordName)
        VALUES ${roles.map(role  => `(${role})`)}`)
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('DELETE FROM roles', (err) => {
                    if (err) {
                        reject(err)
                    }
                });
                this.db.run(`INSERT INTO roles (discordName)
                             VALUES ${roles.map(role  => `('${role}')`)}`
                             , (err) => {
                                 if (err) {
                                     reject(err)
                                 }
                                 resolve();
                             });
            });
        })
    }

    async addSynchronizedRoles(role) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT OR IGNORE INTO roles (discordName)
                         VALUES ('${role}')`, (err) => {
                            if (err) {
                                reject(err);
                            }
                            resolve();
                         });
        });
    }

    async removeSynchronizedRoles(role) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM roles
                         WHERE discordName =  '${role}'`, (err) => {
                            if (err) {
                                reject(err);
                            }
                            resolve();
                         });
        });
    }

    

    async getTeamspeakIDByDiscordId(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT teamspeakID from members WHERE discordID = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row.teamspeakID);
            })
        })
    }

    async getDiscodIDByTeamspeakID(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT discordID from members WHERE teamspeakID = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (row) {
                    resolve(row.discordID);
                } else {
                    resolve(undefined);
                }
            })
        })
    }
}

module.exports = new Database()