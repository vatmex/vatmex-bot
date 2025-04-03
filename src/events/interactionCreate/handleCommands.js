const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (bot, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.userPermissions?.length) {
      for (const permission of commandObject.userPermissions) {
        if (!interaction.member.permissions.has(permission)) {
          interaction.reply({
            content: 'No tienes permiso para ejecutar este comando.',
            ephemeral: true,
          });

          break;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const botMember = interaction.guild.members.me;

        if (!botMember.permissions.has(permission)) {
          interaction.reply({
            content: 'No tengo suficientes permisos para este comando.',
            ephemeral: true,
          });

          break;
        }
      }
    }

    await commandObject.callback(bot, interaction);
  } catch (error) {
    console.log(
      `${new Date().toISOString()} - ERROR: Could not run command: ${error}.`
    );
  }
};
