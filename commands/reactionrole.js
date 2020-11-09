module.exports = {
	name: 'reactionrole',
	cooldown: 0,
	execute(message, args) {
		if (message.author.id!="634776327299399721" && message.author.id!="583865257945202699") return
		const notificationEmbed = {
			"title": "Get Notification Roles [NOT WORKING YET]",
			"description": "React to this message with the relevant emojis to be notified for updates to certain packs. If <@775437047367598080> is offline, please click [here](https://chubot.beatso1.repl.co/) to wake it up.",
			"color": 16087843,
			"fields": [
				{
					"name": "Different Default",
					"value": "React with <:differentdefault:775100107611439144>",
					"inline": true
				}
			]
		}
		const getRolesChannel = message.guild.channels.cache.get("775099645046685737")
		/*getRolesChannel.send({ embed: notificationEmbed }).then(reactionMessage=>{
            reactionMessage.react("775100107611439144")
        })*/
		getRolesChannel.messages.fetch("775439685828083752")
			.then(msg => {
				msg.edit({ embed: notificationEmbed })
					.then((msg1) => {
						// updated message
					})
					.catch(console.error);
			});
	},
};