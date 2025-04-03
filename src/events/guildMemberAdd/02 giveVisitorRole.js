// eslint-disable-next-line no-unused-vars
const { Client, GuildMember } = require('discord.js');

/**
 * Saves a log of a new user joining the Guild.
 *
 * @param {Client} bot
 * @param {GuildMember} member
 */
module.exports = async (bot, member) => {
  try {
    const { guild } = member;

    // eslint-disable-next-line no-useless-return
    if (!guild) return;

    const visitorRole = guild.roles.cache.get(process.env.VISITOR_ROLE_ID);
    await member.roles.add(visitorRole);

    console.log(
      `${new Date().toISOString()} - GUILD: Assigned visitor role to user ${
        member.user.tag
      }.`
    );
  } catch (error) {
    console.log(
      `${new Date().toISOString()} - ERROR: Failed to assign visitor role to user ${
        member.user.tag
      }.`
    );
  }
};
