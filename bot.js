
// Declare constants which will be used throughout the bot.

const config = require("./config.json");
const fs = require("fs");
const {
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	REST,
	Routes
} = require("discord.js");


const { reloadScheduledTasks } = require("./src/utils/scheduler.js");

const Database = require('./src/api/constants/sql.js');
const dbInstance = Database; 

const startExpressServer = require('./src/api/constants/express.js'); // Import the Express server
console.log('Starting Express server...');
startExpressServer(); // This ensures the Express server starts when the bot is ready




/**
 * From v13, specifying the intents is compulsory.
 * @type {import('./typings').Client}
 * @description Main Application Client */

// @ts-ignore
const client = new Client({
	// Please add all intents you need, more detailed information @ https://ziad87.net/intents/
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates
	],
	partials: [Partials.Channel],
});



/**********************************************************************/
// Below we will be making an event handler!

/**
 * @description All event files of the event handler.
 * @type {String[]}
 */
(async () => {
	await reloadScheduledTasks(client);
})();

const eventFiles = fs
	.readdirSync("./src/events")
	.filter((file) => file.endsWith(".js"));

// Loop through all files and execute the event when it is actually emmited.
for (const file of eventFiles) {
	const event = require(`./src/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(
			event.name,
			async (...args) => await event.execute(...args, client)
		);
	}
}

const { subscribeToChannel } = require('./src/api/constants/redisManager.js');
(async () => {
	try {
		const discordChannelId = '1344284062717710346'; // Replace with your Discord channel ID
		await subscribeToChannel(client, discordChannelId, 'nuvotifier:votes');
	} catch (err) {
		console.error('Error subscribing to Redis channel:', err);
	}
})();



/**********************************************************************/
// Define Collection of Commands, Slash Commands and cooldowns

client.commands = new Collection();
client.slashCommands = new Collection();
client.buttonCommands = new Collection();
client.selectCommands = new Collection();
client.contextCommands = new Collection();
client.modalCommands = new Collection();
client.cooldowns = new Collection();
client.autocompleteInteractions = new Collection();
client.triggers = new Collection();


/**********************************************************************/
// Registration of Message-Based Legacy Commands.

/**
 * @type {String[]}
 * @description All command categories aka folders.
 */

const commandFolders = fs.readdirSync("./src/commands");

// Loop through all files and store commands in commands collection.

for (const folder of commandFolders) {
	const commandFiles = fs
		.readdirSync(`./src/commands/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`./src/commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

/**********************************************************************/
// Registration of Slash-Command Interactions.

/**
 * @type {String[]}
 * @description All slash commands.
 */

const slashCommands = fs.readdirSync("./src/interactions/slash");

// Loop through all files and store slash-commands in slashCommands collection.

for (const module of slashCommands) {
    const commandFiles = fs
        .readdirSync(`./src/interactions/slash/${module}`)
        .filter((file) => file.endsWith(".js"));

    for (const commandFile of commandFiles) {
        const command = require(`./src/interactions/slash/${module}/${commandFile}`);
        if (!command.data || !command.data.name) {
            console.error(`Invalid command structure in file: ./src/interactions/slash/${module}/${commandFile}`);
            continue;
        }
        client.slashCommands.set(command.data.name, command);
    }
}

/**********************************************************************/
// Registration of Autocomplete Interactions.

/**
 * @type {String[]}
 * @description All autocomplete interactions.
 */

const autocompleteInteractions = fs.readdirSync("./src/interactions/autocomplete");

// Loop through all files and store autocomplete interactions in autocompleteInteractions collection.

for (const module of autocompleteInteractions) {
	const files = fs
		.readdirSync(`./src/interactions/autocomplete/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const interactionFile of files) {
		const interaction = require(`./src/interactions/autocomplete/${module}/${interactionFile}`);
		client.autocompleteInteractions.set(interaction.name, interaction);
	}
}

/**********************************************************************/
// Registration of Context-Menu Interactions

/**
 * @type {String[]}
 * @description All Context Menu commands.
 */

const contextMenus = fs.readdirSync("./src/interactions/context-menus");

// Loop through all files and store context-menus in contextMenus collection.

for (const folder of contextMenus) {
	const files = fs
		.readdirSync(`./src/interactions/context-menus/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of files) {
		const menu = require(`./src/interactions/context-menus/${folder}/${file}`);
		const keyName = `${folder.toUpperCase()} ${menu.data.name}`;
		client.contextCommands.set(keyName, menu);
	}
}

/**********************************************************************/
// Registration of Button-Command Interactions.

/**
 * @type {String[]}
 * @description All button commands.
 */

const buttonCommands = fs.readdirSync("./src/interactions/buttons");

// Loop through all files and store button-commands in buttonCommands collection.

for (const module of buttonCommands) {
	const commandFiles = fs
		.readdirSync(`./src/interactions/buttons/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./src/interactions/buttons/${module}/${commandFile}`);
		client.buttonCommands.set(command.id, command);
	}
}



/**********************************************************************/
// Registration of Modal-Command Interactions.

/**
 * @type {String[]}
 * @description All modal commands.
 */

const modalCommands = fs.readdirSync("./src/interactions/modals");

// Loop through all files and store modal-commands in modalCommands collection.

for (const module of modalCommands) {
	const commandFiles = fs
		.readdirSync(`./src/interactions/modals/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./src/interactions/modals/${module}/${commandFile}`);
		client.modalCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Registration of select-menus Interactions

/**
 * @type {String[]}
 * @description All Select Menu commands.
 */

const selectMenus = fs.readdirSync("./src/interactions/select-menus");

// Loop through all files and store select-menus in selectMenus collection.

for (const module of selectMenus) {
	const commandFiles = fs
		.readdirSync(`./src/interactions/select-menus/${module}`)
		.filter((file) => file.endsWith(".js"));
	for (const commandFile of commandFiles) {
		const command = require(`./src/interactions/select-menus/${module}/${commandFile}`);
		client.selectCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Registration of Slash-Commands in Discord API

const rest = new REST({ version: "9" }).setToken(config.bot.token);

const commandJsonData = [
    ...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
    ...Array.from(client.contextCommands.values()).map((c) => c.data),
];

// List of guild IDs where you want to register commands
const guildIds = [
	config.global.atm_guild_id,
	config.global.test_guild_id,
	config.global.cottagequest_guild_id,	
];

(async () => {
    try {
        console.log("Started refreshing guild-specific application (/) commands.");

        // Loop through each guild and register commands
        for (const guildId of guildIds) {
            await rest.put(
                Routes.applicationGuildCommands(config.bot.client_id, guildId),
                { body: commandJsonData }
            );
            console.log(`Successfully registered commands for guild: ${guildId}`);
        }

        console.log("Successfully reloaded guild-specific application (/) commands.");
    } catch (error) {
        console.error("Error registering guild-specific commands:", error);
    }
})();

/**********************************************************************/
// Registration of Message Based Chat Triggers

/**
 * @type {String[]}
 * @description All trigger categories aka folders.
 */

const triggerFolders = fs.readdirSync("./src/triggers");

// Loop through all files and store triggers in triggers collection.

for (const folder of triggerFolders) {
	const triggerFiles = fs
		.readdirSync(`./src/triggers/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of triggerFiles) {
		const trigger = require(`./src/triggers/${folder}/${file}`);
		client.triggers.set(trigger.name, trigger);
	}
}

// Login into your client application with bot's token.
client.login(config.bot.token);
