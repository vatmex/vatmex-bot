// Import dependencies
const { EmbedBuilder } = require('discord.js');

const application = (req, res, bot) => {
  const newApplicationEmbed = new EmbedBuilder()
    .setColor('13437C')
    .setTitle('Nueva Solicitud ATC')
    .setURL(
      `https://www.vatmex.com.mx/ops/training/applications/${req.body.application.id}`
    )
    .setDescription(
      `\`\`\`js\n${req.body.application.name} [${req.body.application.cid}] ha mandado una solicitud de entrenamiento ATC!\`\`\``
    )
    .setTimestamp();

  bot.channels.cache
    .get(process.env.STAFF_CHANNEL_ID)
    .send({ embeds: [newApplicationEmbed] });

  res.send('Evento noticiado con exito!');
};

module.exports = { application };
