const fs = require('fs')
const Discord = require('discord.js')
const { prefix,channelIDs,color} = require('./config.json')
const reactionRoleData = require("./reactionroles.json")
require("dotenv").config()
const keepAlive = require('./server')

const client = new Discord.Client({partials: ["MESSAGE","CHANNEL","REACTION"]})
client.commands = new Discord.Collection()
module.exports.client = client
const creationsWebhook = new Discord.WebhookClient(process.env.creationswebhookid,process.env.creationswebhooktoken)
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

const cooldowns = new Discord.Collection()
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

client.once('ready', () => {
	console.log('bot running')
	client.user.setActivity("h",{type:"WATCHING"})
})

client.on('message', message => {
	if (!message.content.startsWith(prefix)) return

	const args = message.content.slice(prefix.length).split(/ +/)
	const command = args.shift().toLowerCase()
	
	if (!client.commands.has(command)) return

	// cooldown stuff
	if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection())
	const now = Date.now()
	const timestamps = cooldowns.get(command.name)
	const cooldownAmount = (command.cooldown || 3) * 1000
	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing that command.`)
		}
	}
	timestamps.set(message.author.id, now)
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

	try {
		client.commands.get(command).execute(message, args)
	} catch (error) {
		console.error(error)
		message.reply('there was an error trying to execute that command!')
	}
})

client.on("message", message => {
	if (message.channel.id!=channelIDs.communityCreations||message.author.id==client.user.id) return
	if (
		message.attachments.array().length==0 && // there is not an attachment
		!message.content.includes("http://") && // there not is a link
		!message.content.includes("https://") //there is not a link
	) {
		message.delete()
		message.reply("your message was deleted because it didn't have an attachment, image or link. Please use <#775426497816035369> for talking about creations posted in this channel.").then(response=>response.delete({timeout:15000}))
		creationsWebhook.send(message.content,{username:message.author.username,avatarURL:message.author.avatarURL({dynamic:true})})
	}
})

client.on('guildMemberAdd', member => {
	client.channels.cache.get("720325749193572352").send(`Hey <@${member.id}>, welcome to The Chub Club! Go check out <#722152602065829930> !`)
	member.roles.add(member.guild.roles.cache.find(role=>role.id=="764786089445556244")) // add member role
})

client.on("messageReactionAdd", async (reaction, user) => {
	if (reaction.message.partial) await reaction.message.fetch()
	if (reaction.partial) await reaction.fetch()
	if  (!reaction.message.guild) return

	if (reaction.message.channel.id == channelIDs.getRoles) {

		const name = reactionRoleData.map(x=>x.name).indexOf(reaction.emoji.name)
		const id = reactionRoleData.map(x=>x.id).indexOf(reaction.emoji.id)

		if ( name != -1 || id != -1 ) {
			if ( name != -1 ) var data = reactionRoleData[name]
			else var data = reactionRoleData[id]
			if ( reaction.message.id == data.messageID ) await reaction.message.guild.members.cache.get(user.id).roles.add(data.role)
		}

	}
})

client.on("messageReactionRemove", async (reaction, user) => {
	if (reaction.message.partial) await reaction.message.fetch()
	if (reaction.partial) await reaction.fetch()
	if  (!reaction.message.guild) return

	if (reaction.message.channel.id == channelIDs.getRoles) {

		const name = reactionRoleData.map(x=>x.name).indexOf(reaction.emoji.name)
		const id = reactionRoleData.map(x=>x.id).indexOf(reaction.emoji.id)

		if ( name != -1 || id != -1 ) {
			if ( name != -1 ) var data = reactionRoleData[name]
			else var data = reactionRoleData[id]
			if ( reaction.message.id == data.messageID ) await reaction.message.guild.members.cache.get(user.id).roles.remove(data.role)
		}

	}

})

keepAlive()
client.login(process.env.discordtoken)