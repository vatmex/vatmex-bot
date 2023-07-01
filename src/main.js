require('dotenv').config();

const {Client, IntentsBitField, EmbedBuilder} = require('discord.js');

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
				// First build the controllers position name
				let position = callsignToText(controller.callsign);

				// Creates a new embed style message
				const newControllerEmbed = new EmbedBuilder()
					.setColor("13437C")
					.setTitle(`${position} en linea!`)
					.setURL(`https://stats.vatsim.net/stats/${controller.cid}`)
					.setDescription(`${controller.name} [${controller.cid}] se ha conectado en ${position} [${controller.callsign}]!`)
					.setThumbnail('https://cdn.discordapp.com/attachments/803128345930760195/1124765846988927038/Imagotipo-01.png')
					.setTimestamp(Date.now())

				client.channels.cache.get(process.env.ACTIVITY_CHANNEL_ID).send({embeds: [newControllerEmbed]});
				console.log(`${new Date().toISOString()} - Message sent: ${position} en linea! : ${controller.cid} [${controller.callsign}]`);
			}
		}
	}
	
	for (const controllerCallsign in controllersOnline) 
	{
		if (!newControllersOnline[controllerCallsign]) 
		{
			// First build the controllers position name
			let position = callsignToText(controllerCallsign);
			// This controller just went offline

			// Creates a new embed style message
			const offlineControllerEmbed = new EmbedBuilder()
			.setColor("13437C")
			.setTitle(`${position} se ha desconectado.`)
			.setDescription(`${position} [${controllerCallsign}] se ha desconectado`)
			.setThumbnail('https://cdn.discordapp.com/attachments/803128345930760195/1124765846988927038/Imagotipo-01.png')
			.setTimestamp(Date.now())
			
		  	client.channels.cache.get(process.env.ACTIVITY_CHANNEL_ID).send({embeds: [offlineControllerEmbed]});
			console.log(`${new Date().toISOString()} - Message sent: ${controllerCallsign} se ha desconectado.`);
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
		// Creates a new embed style message
		const controllerListEmbed = new EmbedBuilder()
		.setColor("13437C")
		.setTitle(`Lista de controladores:`)
		.setThumbnail('https://cdn.discordapp.com/attachments/803128345930760195/1124765846988927038/Imagotipo-01.png')
		.setTimestamp(Date.now())

		for (var i = 0; i < activeControllers.length; i++) 
		{
			let position = callsignToText(activeControllers[i].callsign);

			controllerListEmbed.addFields({ name: position, value: `${position} [${activeControllers[i].callsign}] : ${activeControllers[i].name} [${activeControllers[i].cid}]` })
		}

		interaction.reply({embeds: [controllerListEmbed]});
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
