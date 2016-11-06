var express = require('express');
var http = require('http');
var path = require('path');
var ioCtor = require('socket.io');
var uuid = require('node-uuid');
var zmq = require('zmq');
var sock = zmq.socket('pull');
var msgpack = require('msgpack');
var sharp = require('sharp');

/**
 * connect zmq
 */
sock.connect(process.env['TENSORFLOW_PORT_8888_TCP']);

/**
 * ws connections
 */
var wsclients = {}

sock.on('message', function(msg){
  var res = msgpack.unpack(msg);
  var asBuff = Buffer.from(res.data);
  var fileres = res.epochId + '-' + res.wIdx + '.png';
  var rawOpts = {
    width: 28,
    height: 28,
    channels: 3
  };

  sharp(asBuff, { raw: rawOpts })
    .png()
    .toBuffer((err, buf, info) => {
      if(err) {
        console.log(err);
      }
      else {
        var emitdata = {
          wIdx: res.wIdx,
          data: buf.toString('base64')
        };
        for(var k in wsclients) {
          wsclients[k].emit('epochdone', emitdata);
        }
      }
    });

});


/**
 * call various server constructors
 */
const app = express();
const server = http.Server(app);


/**
 * use ejs as template engine
 */
app.set('view engine', 'ejs');
app.set('views', 'views');


/**
 * serve static content
 */
app.use(express.static('public'));


/**
 * render index.ejs
 */
app.get('/', (req, res) => {
  res.render('index');
});

var io = ioCtor(server);
io.on('connection', function(client){
  var clientId = uuid.v4();
  console.log('connected: ', clientId);

  wsclients[clientId] = client;

  client.on('disconnect', function(){
    delete wsclients[clientId];
    console.log('disconnected: ', clientId);
  });
});

var wsport = 8844;

/**
 * start server
 */
server.listen(wsport, () => {
  console.log('SERVER RUNNING.');
});
