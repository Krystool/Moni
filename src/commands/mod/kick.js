const { Command } = require('discord-akairo');

class KickCommand extends Command {
	constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES', 'KICK_MEMBERS'],
			description: {
				content: 'Kick, c\' est simple non ?',
				usage: '<member>',
				examples: ['kick @Moni', 'kick Suvajit', 'kick 550460160829816833']
			},
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'Qui voulez-vous expulser ?',
						retry: 'Veuillez mentionner un member du server.'
					}
				}
			],
			userPermissions: ['KICK_MEMBERS']
		});
	}

	async exec(message, { member }) {
		await member.kick(`Expulsé by ${message.author.tag} (${message.author.id})`).then(() => message.util.reply(`${member} a été kick !`));
	}
}

module.exports = KickCommand;
