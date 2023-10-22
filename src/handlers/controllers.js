// Import Dependencies
const { EmbedBuilder } = require('discord.js');

// Import Utils
const Positions = require('../utils/positions');

let controllersOnline = {};

const checkControllers = async (bot) => {
  const response = await fetch(process.env.VATSIM_DATA_URL);
  const data = await response.json();

  const newControllersOnline = {};

  for (const controller of data.controllers) {
    const splittedCallsign = controller.callsign.split('_');

    if (
      controller.callsign.startsWith('MM') && // Only México
      controller.facility !== 0 && // Hide observers
      splittedCallsign[0].length === 4 && // Hide non standard positions
      splittedCallsign[1] !== 'I' // Hide instructors
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
  if (controllersOnline.length === 0) {
    interaction.reply(
      'No hay ningún controlador conectado al momento. ¡Sé el primero!'
    );
  } else {
    // Creates a new embed style message
    const controllerListEmbed = new EmbedBuilder()
      .setColor('13437C')
      .setTitle(`Lista de controladores:`)
      .setTimestamp(Date.now());

    console.log(controllersOnline);

    Object.keys(controllersOnline).forEach((callsign) => {
      const position = Positions.callsignToText(callsign);

      controllerListEmbed.addFields({
        name: position,
        value: `\`\`\`js\n"${position}" [${callsign}] : ${controllersOnline[callsign].name} [${controllersOnline[callsign].cid}]\`\`\``,
      });
    });

    interaction.reply({ embeds: [controllerListEmbed] });
  }
};

module.exports = { checkControllers, listControllers };
