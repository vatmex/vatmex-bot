const { EmbedBuilder } = require('discord.js');

const { getOnlineControllers } = require('../../models/controllers');
const Positions = require('../../utils/positions');
const accs = require('../../navdata/accs.json');

module.exports = {
  name: 'cta',
  description:
    'Muestra una lista de controladores en México conectados a Vatsim.',
  callback: (bot, interaction) => {
    const controllersOnline = getOnlineControllers();

    if (Object.keys(controllersOnline).length === 0) {
      interaction.reply(
        'No hay ningún controlador conectado al momento. ¡Sé el primero!'
      );
    } else {
      // Creates a new embed style message
      const controllerListEmbed = new EmbedBuilder()
        .setColor('13437C')
        .setTitle(`Lista de controladores:`)
        .setTimestamp(Date.now());

      Object.keys(accs).forEach((acc) => {
        let embedValue = '```js\n';
        let isAccEmpty = true;

        Object.keys(controllersOnline).forEach((callsign) => {
          const splitCallsign = callsign.split('_');
          const position = Positions.callsignToText(callsign);

          if (accs[acc][splitCallsign[0]] === true) {
            isAccEmpty = false;
            embedValue += `"${position}" [${callsign}]: ${controllersOnline[callsign].name} ${controllersOnline[callsign].cid}\n`;
          }
        });

        if (!isAccEmpty) {
          embedValue += '```';

          controllerListEmbed.addFields({
            name: accs[acc].name,
            value: embedValue,
          });
        }
      });

      interaction.reply({ embeds: [controllerListEmbed] });
    }
  },
};
