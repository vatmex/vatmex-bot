require('dotenv').config();

const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
  {
    name: 'cta',
    description:
      'Muestra una lista de los controladores de la división conectados a la red',
  },
  {
    name: 'metar',
    description: 'Obtiene la información METAR de una estación',
    options: [
      {
        name: 'icao',
        description: 'Código ICAO de la estación a consultar',
        required: true,
        min_length: 4,
        max_length: 4,
        type: ApplicationCommandOptionType.String,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
  } catch (error) {
    console.log(`${new Date().toISOString()} - Error: ${error}.`);
  }
})();
