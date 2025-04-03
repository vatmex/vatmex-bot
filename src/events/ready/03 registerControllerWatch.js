const { EmbedBuilder } = require('discord.js');
const Positions = require('../../utils/positions');
const { updateControllers } = require('../../models/controllers');

module.exports = (bot) => {
  console.log(
    `${new Date().toISOString()} - SYSTEM: Registered listener updateControllers on 10000ms interval.`
  );

  // Set up the controller check every 10 seconds
  setInterval(updateControllers, 10000, bot, (controller, callsign) => {
    const newControllerEmbed = new EmbedBuilder()
      .setColor('13437C')
      .setTitle(`${Positions.callsignToText(callsign)} en linea!`)
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
      `${new Date().toISOString()} - MESSAGE: ${Positions.callsignToText(
        controller.callsign
      )} en linea! : ${controller.cid} [${controller.callsign}].`
    );
  });
};
