require('dotenv').config();

const axios = require('axios');

const showMetar = async (interaction) => {
  const icao = interaction.options.get('icao').value;

  const request = {
    method: 'get',
    url: `https://api.checkwx.com/metar/${icao.toUpperCase()}/decoded`,
    headers: { 'X-API-Key': '6b3983bd27f541d2a1e83b62b6' },
  };

  axios(request)
    .then(async (response) => {
      // Check if the Metar came out empty.
      if (Object.keys(response.data.data).length === 0) {
        console.log(
          `${new Date().toISOString()} - WARNING: METAR for ${icao.toUpperCase()} came out empty`
        );
        await interaction.reply('El METAR solicitado no fue encontrado');
      }

      const metar = response.data.data[0];

      interaction.reply(metar.raw_text);
    })
    .catch((error) => {
      console.log(
        `${new Date().toISOString()} - ERROR: Failed to fetch data from CheckWX API`
      );
      console.log(error);
      interaction.reply(
        'Ocurrió un error al comunicarnos con el servicio de Metar. ¡Intenta mas tarde!'
      );
    });
};

module.exports = { showMetar };
