const { EmbedBuilder } = require('discord.js');
const station = require('../airports.json');

function callsignToText(callsign) {
  const facility = {
    DEL: 'Autorización',
    GND: 'Terrestre',
    TWR: 'Torre',
    APP: 'Aproximación',
    CTR: 'Centro',
  };

  const facilityName = facility[callsign.slice(-3)];
  const stationName = station[callsign.slice(0, 4)];

  return `${facilityName} ${stationName}`;
}

module.exports = async function (code, client, controller, controllerInRoster) {
  const position = callsignToText(controller.callsign);
  if (code === 200) {
    if (controller.facility === 2 && !controllerInRoster.data.delivery) {
      client.channels.cache
        .get(process.env.UNAUTHORIZED_CHANNEL_ID)
        .send(
          `⚠️ ${controllerInRoster.data.first_name} ${
            controllerInRoster.data.last_name
          } [${controller.cid}] se ha conectado en ${callsignToText(
            controller.callsign
          )} [${controller.callsign}] sin autorización.`
        );
      console.log(
        `${new Date().toISOString()} - Message sent: ${position} en linea sin autorizacion. : ${
          controller.cid
        } [${controller.callsign}]`
      );
    } else if (controller.facility === 3 && !controllerInRoster.data.ground) {
      client.channels.cache
        .get(process.env.UNAUTHORIZED_CHANNEL_ID)
        .send(
          `⚠️ ${controllerInRoster.data.first_name} ${
            controllerInRoster.data.last_name
          } [${controller.cid}] se ha conectado en ${callsignToText(
            controller.callsign
          )} [${controller.callsign}] sin autorización.`
        );
      console.log(
        `${new Date().toISOString()} - Message sent: ${position} en linea sin autorizacion. : ${
          controller.cid
        } [${controller.callsign}]`
      );
    } else if (controller.facility === 4 && !controllerInRoster.data.tower) {
      client.channels.cache
        .get(process.env.UNAUTHORIZED_CHANNEL_ID)
        .send(
          `⚠️ ${controllerInRoster.data.first_name} ${
            controllerInRoster.data.last_name
          } [${controller.cid}] se ha conectado en ${callsignToText(
            controller.callsign
          )} [${controller.callsign}] sin autorización.`
        );
      console.log(
        `${new Date().toISOString()} - Message sent: ${position} en linea sin autorizacion. : ${
          controller.cid
        } [${controller.callsign}]`
      );
    } else if (controller.facility === 5 && !controllerInRoster.data.approach) {
      client.channels.cache
        .get(process.env.UNAUTHORIZED_CHANNEL_ID)
        .send(
          `⚠️ ${controllerInRoster.data.first_name} ${
            controllerInRoster.data.last_name
          } [${controller.cid}] se ha conectado en ${callsignToText(
            controller.callsign
          )} [${controller.callsign}] sin autorización.`
        );
      console.log(
        `${new Date().toISOString()} - Message sent: ${position} en linea sin autorizacion. : ${
          controller.cid
        } [${controller.callsign}]`
      );
    } else if (controller.facility === 5 && !controllerInRoster.data.center) {
      client.channels.cache
        .get(process.env.UNAUTHORIZED_CHANNEL_ID)
        .send(
          `⚠️ ${controllerInRoster.data.first_name} ${
            controllerInRoster.data.last_name
          } [${controller.cid}] se ha conectado en ${callsignToText(
            controller.callsign
          )} [${controller.callsign}] sin autorización.`
        );
      console.log(
        `${new Date().toISOString()} - Message sent: ${position} en linea sin autorizacion. : ${
          controller.cid
        } [${controller.callsign}]`
      );
    } else if (controllerInRoster.inactive) {
      client.channels.cache
        .get(process.env.UNAUTHORIZED_CHANNEL_ID)
        .send(
          `⚠️ ${controllerInRoster.data.first_name} ${
            controllerInRoster.data.last_name
          } [${controller.cid}] se ha conectado en ${callsignToText(
            controller.callsign
          )} [${controller.callsign}] sin autorización.`
        );
      console.log(
        `${new Date().toISOString()} - Message sent: ${position} en linea sin autorizacion. : ${
          controller.cid
        } [${controller.callsign}]`
      );
    } else {
      // Creates a new embed style message
      const newControllerEmbed = new EmbedBuilder()
        .setColor('13437C')
        .setTitle(`${position} en linea!`)
        .setURL(`https://stats.vatsim.net/stats/${controller.cid}`)
        .setDescription(
          `\`\`\`js\n${controller.name} [${controller.cid}] se ha conectado en "${position}" [${controller.callsign}]!\`\`\``
        )
        .setTimestamp(Date.now());

      client.channels.cache
        .get(process.env.ACTIVITY_CHANNEL_ID)
        .send({ embeds: [newControllerEmbed] });
      console.log(
        `${new Date().toISOString()} - Message sent: ${position} en linea! : ${
          controller.cid
        } [${controller.callsign}]`
      );
    }
  } else if (code === 404) {
    client.channels.cache
      .get(process.env.UNAUTHORIZED_CHANNEL_ID)
      .send(
        `⚠️ ${controller.name} [${
          controller.cid
        }] se ha conectado en ${callsignToText(controller.callsign)} [${
          controller.callsign
        }] sin autorización.`
      );
    console.log(
      `${new Date().toISOString()} - Message sent: ${position} en linea sin autorizacion. : ${
        controller.cid
      } [${controller.callsign}]`
    );
  }
};
