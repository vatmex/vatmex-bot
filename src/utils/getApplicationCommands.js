module.exports = async (bot, guildId) => {
  let applicationCommands;

  if (guildId) {
    const guild = await bot.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    applicationCommands = await bot.application.commands;
  }

  await applicationCommands.fetch();

  return applicationCommands;
};
