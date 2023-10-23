// Import dependencies
const { EmbedBuilder } = require('discord.js');

// Import utils
const Positions = require('../utils/positions');

// Import config
const accs = require('../config/accs.json');

let controllersOnline = {};

const checkControllers = async (bot) => {
  const response = await fetch(process.env.VATSIM_DATA_URL);
  const data = await response.json();

  const newControllersOnline = {};

  for (const controller of data.controllers) {
    const splitCallsign = controller.callsign.split('_');

    if (
      controller.callsign.startsWith('MM') && // Only México
      controller.facility !== 0 && // Hide observers
      splitCallsign[0].length === 4 && // Hide non standard positions
      splitCallsign[1] !== 'I' // Hide instructors
    ) {
      const newController = {
        online: true,
        cid: controller.cid,
        name: controller.name,
      };
      newControllersOnline[controller.callsign] = newController;

      if (!controllersOnline[controller.callsign]) {
        // This controller just came online
        const newControllerEmbed = new EmbedBuilder()
          .setColor('13437C')
          .setTitle(
            `${Positions.callsignToText(controller.callsign)} en linea!`
          )
          .setURL(`https://stats.vatsim.net/stats/${controller.cid}`)
          .setDescription(
            `\`\`\`js\n${controller.name} [${
              controller.cid
            }] se ha conectado en "${Positions.callsignToText(
              controller.callsign
            )}" [${controller.callsign}]!\`\`\``
          )
          .setTimestamp(Date.now());

        bot.channels.cache
          .get(process.env.ACTIVITY_CHANNEL_ID)
          .send({ embeds: [newControllerEmbed] });
        console.log(
          `${new Date().toISOString()} - Message sent: ${Positions.callsignToText(
            controller.callsign
          )} en linea! : ${controller.cid} [${controller.callsign}]`
        );
      }
    }
  }

  controllersOnline = newControllersOnline;
};

const listControllers = async (interaction) => {
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
};

module.exports = { checkControllers, listControllers };
