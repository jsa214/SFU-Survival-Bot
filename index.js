const Discord = require('discord.js');
 const client = new Discord.Client();

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('message', msg => {
 if (msg.content === 'ping') {
 msg.reply('pong');
 }
 });

client.login('NTQ4OTQ5MzY4OTk3MjgxODEz.D1MwzA.qliWFI_6B8v1uC4v2B5bu7OR7ZM');
