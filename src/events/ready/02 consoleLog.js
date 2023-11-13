module.exports = (bot) => {
  console.log(
    `${new Date().toISOString()} - SYSTEM: VATMEX Bot logged in succesfully as ${
      bot.user.tag
    }.`
  );
};
