const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (bot) => {
  let localCommands;
  let applicationCommands;

  try {
    localCommands = getLocalCommands();
    applicationCommands = await getApplicationCommands(
      bot,
      process.env.GUILD_ID
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      // Check if the local command is already register in the application.
      // If it is, we will proceed to check for deletions, compare, and update.
      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name
      );

      if (existingCommand) {
        // Check if the local commnand is flagged as deleted.
        // If so, proceeed to delete and exit the loop for this command.
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(
            `${new Date().toISOString()} - COMMANDS: Deleted command /${name}.`
          );
          // eslint-disable-next-line no-continue
          continue;
        }

        // Now we check if the command is now different, if it is, update.
        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          console.log(
            `${new Date().toISOString()} - COMMANDS: Updated command /${name}.`
          );
        }
        // If not, we will register the command to the application.
      } else {
        // If the command is flagged to be deleted. Skip and log.
        if (localCommand.deleted) {
          console.log(
            `${new Date().toISOString()} - COMMANDS: Skipping registering command /${name} as it's flagged for deletion.`
          );
          // eslint-disable-next-line no-continue
          continue;
        }

        // Otherwise we are good to go.
        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(
          `${new Date().toISOString()} - COMMANDS: Registered new command /${name}.`
        );
      }
    }
  } catch (error) {
    console.log(`${new Date().toISOString()} - ERROR: ${error}.`);
  }
};
