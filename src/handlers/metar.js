require('dotenv').config();

// Import dependencies
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const moment = require('moment');

const conditions = {
  BR: 'neblina',
  DS: 'tormenta de polvo',
  DU: 'tormenta de polvo',
  DZ: 'llovizna',
  FC: 'tromba',
  FG: 'niebla',
  FU: 'humo',
  GR: 'granizo',
  GS: 'granizo pequeña',
  HZ: 'bruma',
  IC: 'cristales de hielo',
  PE: 'cristales de hielo',
  PO: 'remolino de polvo',
  RA: 'lluvia',
  SA: 'arena',
  SN: 'nieve',
  SQ: 'turbonada',
  SS: 'tormenta de arena',
  UP: 'precipitación desconocida',
  VA: 'ceniza volcánica',
};

const coverage = {
  FEW: 'pocas nubes',
  SCT: 'medio nublado',
  BKN: 'nublado',
  OVC: 'cerrado',
};

const showMetar = async (interaction) => {
  const icao = interaction.options.get('icao').value;

  const request = {
    method: 'get',
    url: `https://api.checkwx.com/metar/${icao.toUpperCase()}/decoded`,
    headers: { 'X-API-Key': process.env.CHECKWX_API_KEY },
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
      console.log(metar);

      /// Build the readable string and individual properties.
      // Station and time
      let readableMetar = `${metar.station.name} reportado a las ${moment(
        metar.observed
      ).format('HHmm')}UTC, `;
      let windField;
      let visibilityField = '';
      let cloudsField = '';
      // Wind
      if (metar.wind || metar.wind > 5) {
        windField = `${metar.wind.degrees}° ${metar.wind.speed_kts}kts`;
        readableMetar += `viento ${metar.wind.degrees} grados ${metar.wind.speed_kts} nudos, `;
      } else {
        windField = 'Viento calma';
        readableMetar += 'viento calma, ';
      }
      // Visibility
      if (metar.visibility.miles_float < 1) {
        visibilityField = `${metar.visibility.meters_float}M`;
        readableMetar += `visibilidad ${metar.visibility.meters_float} metros, `;
      } else {
        visibilityField = `${metar.visibility.miles_float}NM`;
        readableMetar += `visibilidad ${metar.visibility.miles_float} millas, `;
      }
      // Conditions
      if (metar.conditions) {
        metar.conditions.forEach((condition) => {
          readableMetar += `${conditions[condition.code]}, `;
        });
      }
      // Clouds
      if (metar.clouds) {
        metar.clouds.forEach((layer) => {
          cloudsField += `${
            coverage[layer.code]
          } a ${layer.base_feet_agl.toLocaleString('es-MX')} ft\n`;
          readableMetar += `${
            coverage[layer.code]
          } a ${layer.base_feet_agl.toLocaleString('es-MX')} pies, `;
        });
      }
      readableMetar += `temperatura ${metar.temperature.celsius} grados, `;
      readableMetar += `punto de rocío ${metar.dewpoint.celsius} grados, `;
      readableMetar += `QNH ${metar.barometer.hg}.`;

      // Build the Embed
      const metarEmbed = new EmbedBuilder()
        .setColor(0x13437c)
        .setTitle(`${metar.station.name} - ${metar.icao}`)
        .setURL(`https://metar-taf.com/es/${metar.icao}`)
        .addFields(
          {
            name: 'Interpretación',
            value: readableMetar,
          },
          { name: 'METAR', value: metar.raw_text }
        )
        .addFields(
          {
            name: 'Tiempo del Reporte',
            value: `${moment(metar.observed).format('HH:mm:00')}UTC`,
            inline: true,
          },
          {
            name: 'Reglas de Vuelo',
            value: metar.flight_category,
            inline: true,
          },
          {
            name: 'Viento',
            value: windField,
            inline: true,
          }
        )
        .addFields(
          {
            name: 'Visiblidad',
            value: visibilityField,
            inline: true,
          },
          {
            name: 'Nubes',
            value: cloudsField,
            inline: true,
          },
          {
            name: 'Temperatura',
            value: `${metar.temperature.celsius}°`,
            inline: true,
          }
        )
        .addFields(
          {
            name: 'Punto de Rocío',
            value: `${metar.dewpoint.celsius}°`,
            inline: true,
          },
          {
            name: 'QNH',
            value: `${metar.barometer.hg} inHg`,
            inline: true,
          },
          {
            name: 'Elevación',
            value: `${metar.elevation.feet} ft`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: 'Información de METARs por CheckWX',
        });

      interaction.reply({ embeds: [metarEmbed] });
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
