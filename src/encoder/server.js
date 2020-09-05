var http = require('http'),
  fileSystem = require('fs'),
  path = require('path');

//create a server object:
http
  .createServer(function (req, res) {
    console.log('Started server at 8000');
    var filePath = path.join(__dirname, 'assets/sample_v7_10frames.drcs');
    // var stat = fileSystem.statSync(filePath);

    // response.writeHead(200, {
    //   'Content-Type': 'audio/mpeg',
    //   'Content-Length': stat.size,
    // });

    var readStream = fileSystem.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
  })
  .listen(8000); //the server object listens on port 8080
