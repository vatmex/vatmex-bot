const { updateRigoberto } = require('../../models/callsigns');

module.exports = (bot) => {
  console.log(
    `${new Date().toISOString()} - SYSTEM: Registered listener updateRigoberto on 5000ms interval.`
  );

  // Set up the controller check every 10 seconds
  setInterval(updateRigoberto, 5000, bot, () => {
    console.log(
      `${new Date().toISOString()} - RIGOBERTO: Updated user ID 776324184874680331 to Rigo el Puma - 1523823.`
    );
  });
};
