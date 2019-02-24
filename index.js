const {Client, Attachment} = require('discord.js');
const client = new Client();

//sfu road conditions url
const sfuRoadConditionsUrl = 'http://www.sfu.ca/security/sfuroadconditions/';
const rp = require('request-promise');
const cheerio = require('cheerio');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'road') {
        rp(sfuRoadConditionsUrl).then(function(html){
            //success!
            const $ = cheerio.load(html);
            var roadStatus = $('.roadStatus').text();

            var webcams = $('.webcams').html();

            var webcamImgs = [];
            $('a .webcamimg').each(function(i, elem) {
                var webcamAlt = $(this).attr('alt');
                if(webcamAlt === 'Gaglardi intersection' ||
                    webcamAlt === 'Tower Road South') {
                    webcamImgs.push($(this).attr('src'));
                }
            });
            console.log(webcamImgs);
            msg.channel.send('Roads: ' + roadStatus, {
                files: webcamImgs
            });
        }).catch(function(err){
            //handle error
        });;
    }
});

client.login('NTQ4OTQ5MzY4OTk3MjgxODEz.D1MwzA.qliWFI_6B8v1uC4v2B5bu7OR7ZM');
