var zmq = require('zmq');
var sock = zmq.socket('pull');
var msgpack = require('msgpack');
var sharp = require('sharp');

console.log(process.env['TENSORFLOW_PORT_8888_TCP']);

sock.connect(process.env['TENSORFLOW_PORT_8888_TCP']);
console.log('Worker connected');

sock.on('message', function(msg){
  var res = msgpack.unpack(msg);
  var asBuff = Buffer.from(res.data);
  var fileres = res.epochId + '-' + res.wIdx + '.png';
  var rawOpts = {
    width: 28,
    height: 28,
    channels: 3
  };

  sharp(asBuff, { raw: rawOpts }).png().toFile('./imresults/' + fileres, (err) => {
    if(err) {
      console.log(err);
    }
    else {
      console.log('OK')
    }
  });
});
