const path = require('path');
const getAllFiles = require('./getAllFiles');

module.exports = (exceptions = []) => {
  const localCommands = [];

  const commandCategories = getAllFiles(
    path.join(__dirname, '..', 'commands'),
    true
  );

  for (const commandCategory of commandCategories) {
    const commandFiles = getAllFiles(commandCategory);

    for (const commandFile of commandFiles) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const commandObject = require(commandFile);

      if (exceptions.includes(commandObject.name)) {
        // eslint-disable-next-line no-continue
        continue;
      }

      localCommands.push(commandObject);
    }
  }

  return localCommands;
};
