const ts = require("../teamspeak");
const db = require("../database");
const _ = require("lodash");
const config = require("../config");

// TODO: MOVE TS CLIENT CODE TO TEAMSPEAK.JS
async function getTeamspeakRoles(cldbID, roles) {
  let tsRoles = await ts.client.serverGroupsByClientId(cldbID).catch((ex) => {
    console.log("cldbid ", cldbID, ex);
  });
  let roleNames = [];
  let rolesKeyedByTeamspeak = _.keyBy(roles, "teamspeak");
  tsRoles.forEach((r) => {
    if (rolesKeyedByTeamspeak[r.name])
      roleNames.push(rolesKeyedByTeamspeak[r.name]);
  });
  return roleNames;
}

// TODO: MOVE DISCORD CLIENT CODE TO DISCORD.JS
async function getDiscordRoles(member, roles) {
  let discordRoles = member.roles.cache;
  let roleNames = [];
  let rolesKeyedByDiscord = _.keyBy(roles, "discord");
  discordRoles.forEach((r) => {
    if (rolesKeyedByDiscord[r.name])
      roleNames.push(rolesKeyedByDiscord[r.name]);
  });
  return roleNames;
}

// TODO: MOVE TS CLIENT CODE TO TEAMSPEAK.JS
function GetPrimaryAndSecondaryRoles(discordRoles, TeamspeakRoles) {
  return config.bot.master === "discord"
    ? { masterRoles: discordRoles, secondaryRoles: TeamspeakRoles }
    : { masterRoles: TeamspeakRoles, secondaryRoles: discordRoles };
}

/*
  master [ 1, 2]
  second [ 1, 3 ]
  diff = [2, 3]
  intersect(master, diff) = [2]
  intersect(second, diff) = [3]
*/

async function getMissingRoles(discordRoles, teamspeakRoles) {
  let { masterRoles, secondaryRoles } = GetPrimaryAndSecondaryRoles(
    discordRoles,
    teamspeakRoles
  );
  console.log("missing roles executed");
  let missing = _.difference(masterRoles, secondaryRoles);
  return missing;
}

async function getExtraRoles(discordRoles, teamspeakRoles) {
  let { masterRoles, secondaryRoles } = GetPrimaryAndSecondaryRoles(
    discordRoles,
    teamspeakRoles
  );
  let extra = _.difference(secondaryRoles, masterRoles);
  return extra;
}

async function addTeamspeakRole(cldbID, role) {
  let group = await ts.client
    .getServerGroupByName(role.teamspeak)
    .catch((ex) => {
      console.log("cldbid ", cldbID, "role ", role, ex);
    });
  if (!group) return console.log("Group ", role, "not found!");
  await ts.client.serverGroupAddClient(cldbID, group).catch((ex) => {
    console.log("cldbID ", cldbID, "role ", role, ex);
  });
}

async function removeTeamspeakRole(cldbId, role) {
  let group = await ts.client
    .getServerGroupByName(role.teamspeak)
    .catch((ex) => {
      console.log("cldbid ", cldbID, "role ", role, ex);
    });
  if (!group) return console.log("Group ", role, "not found!");
  await ts.client.serverGroupDelClient(cldbId, group).catch((ex) => {
    console.log("cldbId ", cldbId, "role ", role, ex);
  });
}

// TODO: IMPLMENT DISCORD CLIENT CODE IN DISCORD.JS & THIS FUNCTION
async function addDiscordRole(member, role) {
  throw new Error("Not implemented");
}

// TODO: IMPLMENT DISCORD CLIENT CODE IN DISCORD.JS & THIS FUNCTION
async function removeDiscordRole(member, role) {
  throw new Error("Not implemented");
}

async function sync(tsID, member) {
  try {
    console.log("syncing", tsID, member.user.name);
    let teamspeakId = (await ts.client.clientGetDbidFromUid(tsID)).cldbid;
    let syncedRoles = await db.getSynchronizedRoles();
    let RolesUserHasDiscord = await getDiscordRoles(member, syncedRoles);
    let RolesUserHasTeamspeak = await getTeamspeakRoles(
      teamspeakId,
      syncedRoles
    );

    missingRoles = await getMissingRoles(
      RolesUserHasDiscord,
      RolesUserHasTeamspeak
    );

    extraRoles = await getExtraRoles(
      RolesUserHasDiscord,
      RolesUserHasTeamspeak
    );

    console.log("Roles User Has Discord: ", RolesUserHasDiscord);
    console.log("Roles User Has Teamspeak: ", RolesUserHasTeamspeak);

    console.log("Missing Roles: ", missingRoles);
    for (const role of missingRoles) {
      config.bot.master === "discord"
        ? addTeamspeakRole(teamspeakId, role)
        : addDiscordRole(member, role);
    }

    console.log("Extra Roles: ", extraRoles);
    for (let role of extraRoles) {
      config.bot.master === "discord"
        ? removeTeamspeakRole(teamspeakId, role)
        : removeDiscordRole(member, role);
    }
  } catch (ex) {
    console.log("Error synchronising user: " + member.username, ex);
  }
}

module.exports = async function synchroniseUser(member) {
  tsIDs = await db.getTeamspeakIDByDiscordId(member.user.id);
  for (const tsID of tsIDs) {
    await sync(tsID, member);
  }
};
