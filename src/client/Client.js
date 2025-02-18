const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const path = require('path');
const Database = require('../struct/Database');
const Setting = require('../models/settings');
const SettingsProvider = require('../struct/SettingsProviders');

class Client extends AkairoClient {
	constructor(config) {
		super({ ownerID: '444214832787357707' }, {
			messageCacheMaxSize: 50,
			messageCacheLifetime: 300,
			messageSweepInterval: 900,
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});

		this.commandHandler = new CommandHandler(this, {
			directory: path.join(__dirname, '..', 'commands'),
			aliasReplacement: /-/g,
			prefix: message => this.settings.get(message.guild, 'prefix', '.'),
			allowMention: true,
			fetchMembers: true,
			commandUtil: true,
			commandUtilLifetime: 3e5,
			commandUtilSweepInterval: 9e5,
			handleEdits: true,
			defaultCooldown: 3000,
			argumentDefaults: {
				prompt: {
					modifyStart: (msg, text) => text && `${msg.author} **::** ${text}\ntype \`cancel\` to cancel this command.`,
					modifyRetry: (msg, text) => text && `${msg.author} **::** ${text}\ntype \`cancel\` to cancel this command.`,
					timeout: msg => `${msg.author} **::** Time ran out, command has been cancelled.`,
					ended: msg => `${msg.author} **::** Too many retries, command has been cancelled.`,
					cancel: msg => `${msg.author} **::** Command has been cancelled.`,
					retries: 2,
					time: 30000
				}
			}
		});

		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: path.join(__dirname, '..', 'inhibitors')
		});
		this.listenerHandler = new ListenerHandler(this, {
			directory: path.join(__dirname, '..', 'listeners')
		});

		this.config = config;
		this.settings = new SettingsProvider(Setting);
		this.setup();
	}

	setup() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler
		});

		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
	}

	async start() {
		await Database.sync();
		await this.settings.init();
		return this.login(this.config.token);
	}
}

module.exports = Client;
