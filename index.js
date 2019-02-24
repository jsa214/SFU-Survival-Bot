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
          return '51863'
        }
}

//function status(){
client.on('message',msg =>{
  if (msg.content=='145'||msg.content=='143'||msg.content=='95'||msg.content=='144'){
  var link = 'http://api.translink.ca/RTTIAPI/V1/stops/'+bustostop(msg.content)+'/estimates'
  var bus95 = {
      uri: link,
      //'http://api.translink.ca/RTTIAPI/V1/stops/51861/estimates',
      qs: {
        apiKey: 'rx3BUkEmtofrx0Dr9JfZ', // -> uri + '?access_token=xxxxx%20xxxxx'
        count: 1
      }
  };

  rp(bus95).then(function (response) {
        //console.log(response)
        //msg.reply(response)
        //const $ = cheerio.load(html);
        const $=cheerio.load(response);

        var cancel = $('CancelledTrip').text();
        var busNo = bustostop(msg.content)
        // var image1 = $()
        //msg.reply('BUS 95 Status:')
        if (cancel=='false'){
          cancel = 'Running'
        }
        msg.reply(msg.content+": "+cancel);

    }).catch(function (err) {
        msg.reply('not working')
    });
  }
})
//};


client.on('message',msg =>{
  if (msg.content === 'bus'){
    msg.reply(("Route Options: 143, 144, 145, 95"));
    //status();
  }
})

/*
client.on('message', msg => {
      if (msg.content === 'bus') {
        //msg.reply("Route Options: 143, 144, 145, 95")


        var link = 'http://api.translink.ca/RTTIAPI/V1/stops/'+bustostop(95)+'/estimates'
        var bus95 = {
            uri: link,
            //'http://api.translink.ca/RTTIAPI/V1/stops/51861/estimates',
            qs: {
              apiKey: 'rx3BUkEmtofrx0Dr9JfZ', // -> uri + '?access_token=xxxxx%20xxxxx'
              count: 1
            }

            //headers: {
              //'Content-Type': 'application/json'
            //},
            //json: true // Automatically parses the JSON string in the response
        };

        rp(bus95).then(function (response) {
              //console.log(response)
              //msg.reply(response)
              //const $ = cheerio.load(html);
              const $=cheerio.load(response);

              var cancel = $('CancelledTrip').text();
              var busNo = bustostop(95)
              // var image1 = $()
              //msg.reply('BUS 95 Status:')
              if (cancel=='false'){
                cancel = 'Running'
              }
              msg.reply(busNo+cancel);

          }).catch(function (err) {
              msg.reply('not working')
          });
    }
});*/

client.login('NTQ4OTQ5MzY4OTk3MjgxODEz.D1MwzA.qliWFI_6B8v1uC4v2B5bu7OR7ZM');
