require('dotenv').config();

const updateRigoberto = async (bot, callback) => {
  const server = bot.guilds.cache.get(process.env.GUILD_ID);
  const rigoberto = await server.members.fetch('776324184874680331');
  rigoberto.setNickname('Rigo el Puma - 1523823');

  console.log(rigoberto);
};

module.exports = { updateRigoberto };
