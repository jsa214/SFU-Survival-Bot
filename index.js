const {Client, Attachment} = require('discord.js');
const client = new Client();
const rp = require('request-promise');
const cheerio = require('cheerio');

//sfu road conditions url
const sfuRoadConditionsUrl = 'http://www.sfu.ca/security/sfuroadconditions/';
//sfu api
const sfuApi = 'http://api.lib.sfu.ca/weather/forecast';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.includes('road')) {
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
            msg.channel.send('Roads: ' + roadStatus, {
                files: webcamImgs
            });
        }).catch(function(err){
            //handle error
        });;
    }

    if(msg.content === 'bus'){
        msg.reply(("Route Options: 143, 144, 145, 95"));
    }

    if(msg.content=='145'||msg.content=='143'||msg.content=='95'||msg.content=='144'){
        var link = 'http://api.translink.ca/RTTIAPI/V1/stops/'+bustostop(msg.content)+'/estimates'
        var bus95 = {
            uri: link,
            //'http://api.translink.ca/RTTIAPI/V1/stops/51861/estimates',
            qs: {
                apiKey: 'rx3BUkEmtofrx0Dr9JfZ', // -> uri + '?access_token=xxxxx%20xxxxx'
                count: 1
            }
        };

        rp(bus95)
            .then(function (response) {
                //console.log(response)
                //msg.reply(response)
                //const $ = cheerio.load(html);
                const $=cheerio.load(response);
                var cancel = $('CancelledTrip').text();
                var time = $('ExpectedLeaveTime').text();
                var busNo = bustostop(msg.content)
                var image1 = $()

                if (cancel=='false'){
                cancel = 'Running'
                }
                else{
                cancel ='Cancelled'
                }
                msg.reply(msg.content+": ")
                msg.reply('Status: '+cancel)
                //msg.reply(msg.content+": "+cancel);
                msg.reply("Expected Leave Time (Upper Loop): "+time);

            })
            .catch(function (err) {
                msg.reply('not working')
            });
    }

    if(msg.content.includes('weather')) {
        var options;
        if(msg.content.includes('surrey')) {
            options = {
                uri: sfuApi,
                qs: {
                    key: '2dd8bd4c210b4470127f6bf5255dd993',
                    lat: 49.187873,
                    lng: -122.848297,
                    location: 'surrey'
                },
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };
        } else if(msg.content.includes('vancouver')) {
            options = {
                uri: sfuApi,
                qs: {
                    key: '2dd8bd4c210b4470127f6bf5255dd993',
                    lat: 49.284462,
                    lng: -123.111719,
                    location: 'vancouver'
                },
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };
        } else {
            options = {
                uri: sfuApi,
                qs: {
                    key: '2dd8bd4c210b4470127f6bf5255dd993',
                    lat: 49.2792,
                    lng: -122.9086,
                    location: 'burnaby'
                },
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };
        }


        rp(options)
            .then(function (response) {
                var current = response.currently;
                var today = response.today;
                var tomorrow = response.tomorrow;
                var msgBuilder = 'Current:\n'
                    + '\t' + current.temperature + ' °\t' + current.summary
                    + '\nToday:\n'
                    + '\t' + today.max_temperature + '°/' + today.min_temperature + '°\t' + today.summary
                    + '\nTomorrow:\n'
                    + '\t' + tomorrow.max_temperature + '°/' + tomorrow.min_temperature + '°\t' + tomorrow.summary;
                msg.channel.send(msgBuilder);
            })
            .catch(function (err) {
            });

    }
});

function bustostop(busNo){
    if (busNo==95){
      return '53096'
    }
    if (busNo==145){
      return '51861'
    }
    if (busNo=144){
      return '52807'
    }
    if (busNo=143){
      return '52998'
    }
}

client.login('NTQ4OTQ5MzY4OTk3MjgxODEz.D1MwzA.qliWFI_6B8v1uC4v2B5bu7OR7ZM');
