/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const { Client, IntentsBitField } = require('discord.js');
const express = require('express');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const API = require('./middleware/api');

// Import Controllers
const notificationController = require('./controllers/notificationController');

// Import Handlers
const eventHandler = require('./handlers/eventHandler');

// Generate an instance of the Express app
const app = express();
app.disable('x-powered-by');

// Init error monitoring with Sentry
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

// Load middleware
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Start a new Discor bot
const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

app.post('/application', API.authenticateKey, (req, res) => {
  notificationController.application(req, res, bot);
});

// Add the sentry error handler after all the controllers for ExpressJS
app.use(Sentry.Handlers.errorHandler());

eventHandler(bot);

bot.login(process.env.TOKEN);

// Entry point for the express app;
app.listen(8090, () => {
  console.log(
    `${new Date().toISOString()} - SYSTEM: Web server listening on port 8090.`
  );
});
