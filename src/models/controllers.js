const axios = require('axios');

let controllersOnline = {};

const updateControllers = async (bot, callback) => {
  const request = {
    method: 'get',
    url: process.env.VATSIM_DATA_URL,
  };

  axios(request)
    .then(async (response) => {
      const newControllersOnline = {};

      for (const controller of response.data.controllers) {
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
            callback(controller, controller.callsign);
          }
        }
      }

      controllersOnline = newControllersOnline;
    })
    .catch((error) => {
      console.log(
        `${new Date().toISOString()} - ERROR: Failed to fetch controller data from Vatsim.`
      );
    });
};

const getOnlineControllers = () => controllersOnline;

module.exports = { updateControllers, getOnlineControllers };
