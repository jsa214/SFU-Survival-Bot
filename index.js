/***************************************************/
/******************Project-Escape SFU***************/
/*******************SFU Survival Bot****************/
/***************************************************/
/**************************************02/23/2019***/
/**************************************Jihoon Sung**/

const {Client, Attachment} = require('discord.js');
const client = new Client();
const rp = require('request-promise');
const cheerio = require('cheerio');

//sfu road conditions url
const sfuRoadConditionsUrl = 'http://www.sfu.ca/security/sfuroadconditions/';
//sfu api
const sfuApi = 'http://api.lib.sfu.ca/weather/forecast';

var carpool;
var carpoolFlag = false;
var carpoolPromptMsgId;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


//For the input:
client.on('message', msg => {

    if(!msg.author.bot) {
        //Opening help message
        if((msg.content.includes('hi') || msg.content.includes('hello') || msg.content.includes('help')) && msg.channel.type === 'dm'){
            var helpMsg = 'Hello, I am SFU survival bot! Here are the commands you can try. \n'
                + 'Commands include:\t carpool,\t road,\t bus,\t library/lib,\t weather\n'
                + 'Ex:tell me surrey campus weather';
            msg.channel.send(helpMsg);
        }

        //Carpool Function
        var data;
        if(carpoolFlag && msg.id != carpoolPromptMsgId) {
            data = msg.content.split(",");
            if(data.length != 2 && typeof data[1] == NaN) {
                msg.channel.send("Wrong arguments");
            }

            //Sends to the channel 548960426440786123
            var channel = client.channels.get('548960426440786123');
            //Turn flag to 0
            carpoolFlag = false;
            channel.send("Going down:\n" + "Time: "+  data[0] + "\nNum of Seats: "+ data[1]+"\n(*React with ✅ on this message to reserve a spot. Private Message will be sent once confirmed)")
                .then(message => {
                    carpool = new Carpool(message, data[1], data[0], data[2]);

                });
        }

        if (msg.content.includes('carpool')){
            msg.channel.send("What time? How many seat? Where to meet? (ex: 18:30,3,In front of library)")
                .then(message => {
                    carpoolPromptMsgId = message.id;
                    //Run carpool
                    carpoolFlag = true
                });
        }

        //Road conditions:
        if (msg.content.includes('road')) {
            rp(sfuRoadConditionsUrl).then(function(html){
                //Webscraper cheerio
                const $ = cheerio.load(html);
                var roadStatus = $('.roadStatus').text();
                //Get current webcam images
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



        //Library functions
        if(msg.content.includes('library') || msg.content.includes('lib')){
            var lib = {
                uri: 'http://api.lib.sfu.ca/hours/2/summary',
                json: true
            };
            rp(lib)
                .then(function(response){
                    // .parse(response)
                    for (i=0; i<=2; i++){
                        msg.channel.send(response[i].location+"\n"+"\tOpen Time: "
                        + response[i].open_time+"\n"+ "\tClose Time: "
                        + response[i].close_time);
                    }
                })
                .catch(function (err){
                    msg.reply('not working');
                });
        }

        //Prompt bus functions
        if(msg.content.includes('bus')){
            msg.reply(("Route Options: 143, 144, 145, 95.\nReply with route number."));
        }
        if(msg.content.includes('145') || msg.content.includes('143') || msg.content.includes('95') || msg.content.includes('144')){
            //Get RTTI info from TRANSLINK API
            var link = 'http://api.translink.ca/RTTIAPI/V1/stops/'+bustostop(msg.content)+'/estimates'
            var bus95 = {
                uri: link, //'http://api.translink.ca/RTTIAPI/V1/stops/51861/estimates',
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

        //Weather info from weather API
        if(msg.content.includes('weather')) {
            var options;
            //Surrey Campus
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
            }
            //Vancouver campus
            else if(msg.content.includes('vancouver')) {
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
            }
            //Unless specified, Burnaby Campus:
            else {
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
    }
});


/*****Getting Reactions from Users as Poll Vote*/

client.on('messageReactionAdd', (reaction, user) => {
    if(reaction.message.id === carpool.message.id && reaction.emoji.name === '✅') {
        carpool.addPassenger(user.id);
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if(reaction.message.id === carpool.message.id && reaction.emoji.name === '✅') {
        carpool.removePassenger(user.id);
    }
});


/*Bus Stops*/
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


/*Carpool Class*/
class Carpool {
    constructor(message, seats, time, location) {
        this.driver = message.author.id;
        this.message = message;
        this.seats = seats;
        this.location= location;
        this.time = time;
        this.passengers = [];
    }

    addPassenger(passenger) {
        if(this.passengers.length < this.seats) {
            this.passengers.push(passenger);
            console.log(this.passengers);
        }
        if(this.passengers.length == this.seats) {
            var msg = "Going down:\n" + "Time: "+  carpool.time + "\nMeet at " + this.location;
            this.passengers.forEach((id) => {
                var user = client.users.get(id);
                user.send(msg);
                console.log("send msg to passengers");
            });
        }

    }

    removePassenger(passenger) {
        this.passengers.splice(this.passengers.indexOf(passenger), 1);
        console.log(this.passengers);
    }
}

client.login('NTQ4OTQ5MzY4OTk3MjgxODEz.D1MwzA.qliWFI_6B8v1uC4v2B5bu7OR7ZM');
