require('dotenv').config();

const axios = require('axios');

const showMetar = async (interaction) => {
  const icao = interaction.options.get('icao').value;

  const request = {
    method: 'get',
    url: `https://api.checkwx.com/metar/${icao}/decoded`,
    headers: { 'X-API-Key': process.env.CHECKWX_API_KEY },
  };

  axios(request)
    .then((response) => {
      console.log(JSON.stringify(response.data.data));
    })
    .catch((error) => {
      console.log(error);
      interaction.reply(
        'Ocurrió un error al comunicarnos con el servicio de Metar. ¡Intenta mas tarde!'
      );
    });
};

module.exports = { showMetar };
