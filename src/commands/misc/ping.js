module.exports = {
  name: 'ping',
  description: 'Revisa si el Bot sigue vivo',

  callback: (bot, interaction) => {
    interaction.reply('¡Aún sigo vivo!');
  },
};
