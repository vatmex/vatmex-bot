require('dotenv').config();

const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const express = require('express');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const station = require('./airports.json');
const unauthorizedController = require('./functions/unauthorizedController');
const API = require('./functions/api');

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Store the online controllers
let controllersOnline = {};

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

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

async function checkControllers() {
  const response = await fetch(process.env.VATSIM_DATA_URL);
  const data = await response.json();

  const newControllersOnline = {};

  for (const controller of data.controllers) {
    const splittedCallsign = controller.callsign.split('_');
    if (
      controller.callsign.startsWith('MM') &&
      controller.facility !== 0 &&
      controller.facility !== 1 &&
      controller.rating < 11 &&
      controller.rating > 1 &&
      splittedCallsign[0].length === 4 &&
      splittedCallsign[1] !== 'I'
    ) {
      newControllersOnline[controller.callsign] = true;

      // This controller just came online.

      if (!controllersOnline[controller.callsign]) {
        // Sends an Roster API Request
        const request = await fetch(
          `${process.env.ROSTER_DATA_URL}/${controller.cid}`
        );
        const controllerInRoster = await request.json();
        // Processes facility/position relation
        if (controllerInRoster.code === 200) {
          await unauthorizedController(
            200,
            client,
            controller,
            controllerInRoster
          );
        } else if (controllerInRoster.code === 404) {
          await unauthorizedController(
            404,
            client,
            controller,
            controllerInRoster
          );
        }
      }
    }
  }

  controllersOnline = newControllersOnline;
}

async function listControllers(interaction) {
  const response = await fetch(process.env.VATSIM_DATA_URL);
  const data = await response.json();
  const activeControllers = [];
  for (const controller of data.controllers) {
    const splittedCallsign = controller.callsign.split('_');
    if (
      controller.callsign.startsWith('MM') &&
      controller.facility !== 0 &&
      controller.facility !== 1 &&
      controller.rating < 11 &&
      controller.rating > 1 &&
      splittedCallsign[0].length === 4 &&
      splittedCallsign[1] !== 'I'
    ) {
      activeControllers.push({
        name: controller.name,
        cid: controller.cid,
        callsign: controller.callsign,
      });
    }
  }

  if (activeControllers.length === 0) {
    interaction.reply(
      'No hay ningún controlador conectado al momento. ¡Sé el primero!'
    );
  } else {
    // Creates a new embed style message
    const controllerListEmbed = new EmbedBuilder()
      .setColor('13437C')
      .setTitle(`Lista de controladores:`)
      .setTimestamp(Date.now());

    for (let i = 0; i < activeControllers.length; i += 1) {
      const position = callsignToText(activeControllers[i].callsign);

      controllerListEmbed.addFields({
        name: position,
        value: `\`\`\`js\n"${position}" [${activeControllers[i].callsign}] : ${activeControllers[i].name} [${activeControllers[i].cid}]\`\`\``,
      });
    }

    interaction.reply({ embeds: [controllerListEmbed] });
  }
}

client.on('interactionCreate', (interaction) => {
  if (interaction.isChatInputCommand()) {
    let interactionUsername = '';

    if (interaction.member.nickname) {
      interactionUsername = interaction.member.nickname;
    } else {
      interactionUsername = interaction.user.username;
    }

    switch (interaction.commandName) {
      case 'cta':
        console.log(
          `${new Date().toISOString()} - Commands: ${interactionUsername} solicito el comando /cta`
        );
        listControllers(interaction);
        break;

      default:
        interaction.reply('Comando no implementado. Es culpa de Enrique!');
        break;
    }
  }
});

client.on('ready', () => {
  console.log(`${new Date().toISOString()} - System: Vatmex Bot is online`);

  // Set up the controller check every 10 seconds
  checkControllers();
  setInterval(checkControllers, 10000);
});

app.post('/test', API.authenticateKey, (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

app.post('/application', API.authenticateKey, (req, res) => {
  console.log(req.body.application.cid);

  const newApplicationEmbed = new EmbedBuilder()
    .setColor('13437C')
    .setTitle('Nueva Solicitud ATC')
    .setURL(
      `https://www.vatmex.com.mx/ops/training/applications/${req.body.application.id}`
    )
    .setDescription(
      `\`\`\`js\n${req.body.application.name} [${req.body.application.cid}] ha mandado una solicitud de entrenamiento ATC]!\`\`\``
    )
    .setTimestamp(Date.now());

  client.channels.cache
    .get(process.env.STAFF_CHANNEL_ID)
    .send({ embeds: [newApplicationEmbed] });

  res.send('Evento noticiado con exito!');
});

app.use(Sentry.Handlers.errorHandler());

app.use((err, req, res, next) => {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(`${res.sentry}\n`);
});

app.listen(8090, () => {
  console.log('Bot listening on port 8090');
});

client.login(process.env.TOKEN);
