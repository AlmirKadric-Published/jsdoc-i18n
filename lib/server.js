var fs = require('fs');
var path = require('path');
var http = require('http');
var Router = require('node-router');

//
var config = require('./config');
var serverPort = config.serverPort;
var checkPaths = config.serverCheckPaths;
var wwwPath = path.join(__dirname, '../www');

//
var router = Router();
var route = router.push;

// Action Route Handlers
route('GET', '/list', require('./serverApi/list'));
route('GET', '/get', require('./serverApi/get'));
route('POST', '/set', require('./serverApi/set'));

// Static 'www' File Route Handler
route('GET', function (request, response, next) {
	var requestPath = request.path.substring(1);

	for (var i = 0; i < checkPaths.length; i+= 1) {
		var file = path.join(requestPath, checkPaths[i]);
		var filePath = path.join(wwwPath, file);
		var fileExists = fs.existsSync(filePath);
		var fileStats = (fileExists) ? fs.statSync(filePath) : null;

		// If file exists serve it and stop processing request
		if (fileExists && fileStats.isFile()) {
			fs.createReadStream(filePath).pipe(response);
			console.log('200 GET', '/' + file);
			return;
		}
	}

	// Otherwise file not found, move on
	next();
});

// Start Server
var server = http.createServer(router).listen(serverPort);
console.log('Listening on:', 'http://localhost:' + serverPort);
