// eslint-disable-next-line no-unused-vars
const { Client, GuildMember } = require('discord.js');

/**
 * Saves a log of a new user joining the Guild.
 *
 * @param {Client} bot
 * @param {GuildMember} member
 */
module.exports = (bot, member) => {
  console.log(
    `${new Date().toISOString()} - GUILD: New user ${
      member.user.tag
    } successfully joined the server.`
  );
};
