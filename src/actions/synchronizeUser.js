import ts from "../teamspeak.js";
import db from "../database.js";
import _ from "lodash";
import config from "../config.js";
import log from "../log.js";

// TODO: MOVE TS CLIENT CODE TO TEAMSPEAK.JS
async function getTeamspeakRoles(cldbID, roles) {
  let tsRoles = await ts.client.serverGroupsByClientId(cldbID).catch((ex) => {
    log.error("Could not get TS client information $tsClientId $exception", {
      tsClientId: cldbid,
      exception: ex,
    });
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
      log.error(
        "Could get group to update user TS roles! $clientId $role $exception",
        {
          clientId: cldbID,
          role: role,
          exception: ex,
        }
      );
    });
  if (!group)
    return log.error(
      "Failed to add client to group! Group not found! $clientId $role",
      {
        clientId: cldbID,
        role: role,
        exception: ex,
      }
    );
  await ts.client.serverGroupAddClient(cldbID, group).catch((ex) => {
    log.error(
      "Could not add user to teamspeak group $clientId $role $exception",
      {
        clientId: cldbID,
        role: role,
        exception: ex,
      }
    );
  });
}

async function removeTeamspeakRole(cldbId, role) {
  let group = await ts.client
    .getServerGroupByName(role.teamspeak)
    .catch((ex) => {
      log.error(
        "Could get group to update user TS roles! $clientId $role $exception",
        {
          clientId: cldbID,
          role: role,
          exception: ex,
        }
      );
    });
  if (!group)
    return log.error(
      "Failed to add client to group! Group not found! $clientId $role",
      {
        clientId: cldbID,
        role: role,
        exception: ex,
      }
    );
  await ts.client.serverGroupDelClient(cldbId, group).catch((ex) => {
    log.error(
      "Could not remove user from teamspeak group $clientId $role $exception",
      {
        clientId: cldbID,
        role: role,
        exception: ex,
      }
    );
  });
}

// TODO: IMPLMENT DISCORD CLIENT CODE IN DISCORD.JS & THIS FUNCTION
async function addDiscordRole(member, role) {
  log.error("Discord Role Management Not Implemented");
  throw new Error("Not implemented");
}

// TODO: IMPLMENT DISCORD CLIENT CODE IN DISCORD.JS & THIS FUNCTION
async function removeDiscordRole(member, role) {
  log.error("Discord Role Management Not Implemented");
  throw new Error("Not implemented");
}

async function sync(tsID, member) {
  try {
    log.info("Beginning Sychronisation of User $discordName $tsID", {
      discordName: member.user.username,
      tsID: tsID,
    });
    let teamspeakId = (await ts.client.clientGetDbidFromUid(tsID)).cldbid;
    let syncedRoles = await db.getSynchronizedRoles();
    let RolesUserHasDiscord = await getDiscordRoles(member, syncedRoles);
    let RolesUserHasTeamspeak = await getTeamspeakRoles(
      teamspeakId,
      syncedRoles
    );

    var missingRoles = await getMissingRoles(
      RolesUserHasDiscord,
      RolesUserHasTeamspeak
    );
    var extraRoles = await getExtraRoles(
      RolesUserHasDiscord,
      RolesUserHasTeamspeak
    );

    log.debug("Roles User Has Discord: $RolesUserHasDiscord", {
      RolesUserHasDiscord,
    });
    log.debug("Roles User Has Teamspeak: $RolesUserHasTeamspeak", {
      RolesUserHasTeamspeak,
    });

    log.debug("Missing Roles: $missingRoles", { missingRoles });
    for (const role of missingRoles) {
      config.bot.master === "discord"
        ? addTeamspeakRole(teamspeakId, role)
        : addDiscordRole(member, role);
    }

    log.debug("Extra Roles: $extraRoles", { extraRoles });
    for (let role of extraRoles) {
      config.bot.master === "discord"
        ? removeTeamspeakRole(teamspeakId, role)
        : removeDiscordRole(member, role);
    }
  } catch (ex) {
    log.error("Error synchronising user: $discordName $exception", {
      discordName: member.username,
      exception: ex,
    });
  }
}

export default async function synchroniseUser(member) {
  var tsIDs = await db.getTeamspeakIDByDiscordId(member.user.id);
  for (const tsID of tsIDs) {
    await sync(tsID, member);
  }
}
