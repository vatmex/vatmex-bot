require('dotenv').config();

const {Client, IntentsBitField} = require('discord.js');

// Store the online controllers
let controllersOnline = {};

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	]
});

function callsignToText(callsign) {
	var facility = {
		DEL: 'Autorización',
		GND: 'Terrestre',
		TWR: 'Torre',
		APP: 'Aproximación',
		CTR: 'Centro',
	}

	var station = require("./airports.json")

	var facilityName = facility[callsign.slice(-3)];
	var stationName = station[callsign.slice(0,4)];

	return facilityName + ' ' + stationName;	
}

async function checkControllers() {
	const response = await fetch(process.env.DATA_URL);
	const data = await response.json();

	const newControllersOnline = {};

	for (const controller of data.controllers) {
		if (controller.callsign.startsWith('MM')) {
			newControllersOnline[controller.callsign] = true;
		  	
			// This controller just came online.
			if (!controllersOnline[controller.callsign]) {
				// First build the controllers posicion name
				let position = callsignToText(controller.callsign);

				let message = `${controller.name} [${controller.cid}] se ha conectado en ${position} [${controller.callsign}]!`;

				client.channels.cache.get(process.env.ACTIVITY_CHANNEL_ID).send(message);
				console.log(`${new Date().toISOString()} - Message sent: ${message}`);
			}
		}
	}
	
	for (const controllerCallsign in controllersOnline) 
	{
		if (!newControllersOnline[controllerCallsign]) 
		{
			// This controller just went offline
			let message = `${controllerCallsign} se ha desconectado.`;
			
		  	client.channels.cache.get(process.env.ACTIVITY_CHANNEL_ID).send(`${message}`);
			console.log(`${new Date().toISOString()} - Message sent: ${message}`);
		}
	}
	
	controllersOnline = newControllersOnline;
}

async function listControllers(interaction) {
	const response = await fetch(process.env.DATA_URL);
	const data = await response.json();

	let activeControllers = [];
	for (const controller of data.controllers) 
	{
		if (controller.callsign.startsWith('MM'))
		{
			activeControllers.push(
				{
					name: controller.name,
					cid: controller.cid,
					callsign: controller.callsign,
				}
			);
		}
	}

	if (activeControllers.length === 0)
	{
		interaction.reply('No hay ningún controlador conectado al momento. Sé el primero!');
	}
	else
	{
		let reply = "Los siguientes controladores estan conectados:\n```js\n";

		for (var i = 0; i < activeControllers.length; i++) 
		{
			let position = callsignToText(activeControllers[i].callsign);

			reply += `${position} [${activeControllers[i].callsign}] : ${activeControllers[i].name} [${activeControllers[i].cid}]\n`;
		}

		reply += "```";

		interaction.reply(reply);
	}
}

client.on('ready', (c) => {
	console.log(`${new Date().toISOString()} - System: Vatmex Bot is online`);

	// Set up the controller check every 10 seconds
	checkControllers();
	setInterval(checkControllers, 10000);
});

client.on('interactionCreate', (interaction) => {
	if (interaction.isChatInputCommand())
	{
		var interactionUsername = ""
		if(interaction.member.nickname){
			interactionUsername = interaction.member.nickname
		}else{
			interactionUsername = interaction.user.username
		}
		switch (interaction.commandName) 
		{
			case 'cta':
				console.log(`${new Date().toISOString()} - Commands: ${interactionUsername} solicito el comando /cta`);
				listControllers(interaction);
				break;
		
			default:
				interaction.reply('Comando no implementado. Es culpa de Enrique!');
				break;
		}
	}
});

client.login(process.env.TOKEN);
