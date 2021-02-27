const ts = require('../teamspeak')
const db = require('../database')
const _ = require('lodash');

async function getTeamspeakRoles(cldbID) {
    let roles = await ts.client.serverGroupsByClientId(cldbID);
    let roleNames = [];
    roles.forEach(r => roleNames.push(r.name))
    return roleNames;
 }
 
 async function getDiscordRoles(member) {
     let roles = member.roles.cache;
     let roleNames = [];
     roles.forEach(r => roleNames.push(r.name))
     return roleNames;
 }

 module.exports =  async function synchroniseUser(member, tsID, silent) {
    try {
        tsID = await db.getTeamspeakIDByDiscordId(member.id)
        console.log(tsID)
        let cldbID = (await ts.client.clientGetDbidFromUid(tsID)).cldbid
        let discordRoles = await getDiscordRoles(member);
        let teamspeakRoles = await getTeamspeakRoles(cldbID);
        let syncedRoles = await db.getSynchronizedRoles();

        missingRoles = _.intersection(syncedRoles, _.difference(discordRoles, teamspeakRoles));
        extraRoles = _.intersection(syncedRoles, _.difference(teamspeakRoles, discordRoles));
    
        missingRoles.forEach(async r => {
            let group = await ts.client.getServerGroupByName(r)
            await ts.client.serverGroupAddClient(cldbID, group)
        })
    
        extraRoles.forEach(async r => {
            let group = await ts.client.getServerGroupByName(r)
            await ts.client.serverGroupDelClient(cldbID, group)
        })
        var tsClient = await ts.client.getClientByUid(tsID);
        if (tsClient) {
            if (!silent) {
                ts.sendMessageToClient(tsClient, "Your roles have been updated automatically!")
            }
        } else {
            console.log('User was offline')
        }
        
    } catch (ex) {
        console.log("Error synchronising user: " + member.usernamer, ex)
    }
};