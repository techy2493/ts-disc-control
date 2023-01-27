import ts from '../teamspeak';
import db from '../database';
import _ from 'lodash';

async function getTeamspeakRoles(cldbID) {
    let roles = await ts.client?.serverGroupsByClientId(cldbID);
    let roleNames: Array<string> = [];
    roles?.forEach(r => roleNames.push(r.name))
    return roleNames;
 }
 
 async function getDiscordRoles(member) {
     let roles = member.roles.cache;
     let roleNames: Array<string> = [];
     roles.forEach(r => roleNames.push(r.name))
     return roleNames;
 }

export default async function synchroniseUser(member, silent) {
    try {
        let tsID = await db.getTeamspeakIDByDiscordId(member.user.id)
        let cldbID = (await ts.client?.clientGetDbidFromUid(tsID))?.cldbid
        let discordRoles = await getDiscordRoles(member);
        let teamspeakRoles = await getTeamspeakRoles(cldbID);
        let syncedRoles = await db.getSynchronizedRoles();

        console.log(teamspeakRoles, discordRoles, syncedRoles)
        let missingRoles = _.intersection(syncedRoles, _.difference(discordRoles, teamspeakRoles));
        let extraRoles = _.intersection(syncedRoles, _.difference(teamspeakRoles, discordRoles));
    
        console.log(missingRoles, extraRoles)
        
        for (const role of missingRoles) {
            console.log(role)
            let group = await ts.client?.getServerGroupByName(role)
            if (!group) {
                console.log('Group ', role, 'not found!');
                continue;
            }
            
            if(cldbID)
                await ts.client?.serverGroupAddClient(cldbID, group)
        }
    
        for (let role of extraRoles) {
            let group = await ts.client?.getServerGroupByName(role)
            if (!group)
                return console.log('Group ', role, 'not found!');
            
            if(cldbID)
                await ts.client?.serverGroupDelClient(cldbID, group)
        }

        var tsClient = await ts.client?.getClientByUid(tsID);
        if (tsClient) {
            if (!silent) {
                ts.sendMessageToClient(tsClient, "Your roles have been updated automatically!")
            }
        } else {
            console.log('User was offline')
        }
        
    } catch (ex) {
        console.log("Error synchronising user: " + member.username, ex)
    }
};