const { PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Revisa si el Bot sigue vivo',
  permissionsRequired: [PermissionFlagsBits.Administrator],
  callback: (bot, interaction) => {
    interaction.reply('¡Aún sigo vivo!');
  },
};
