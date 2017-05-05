var db = require('../db.js');
var helpers = require('../helpers.js');
var sendError = helpers.sendError;

module.exports = function (request, response) {
	var type = request.query.type;
	if (!type) {
		sendError('GET', request.url, response, 'Invalid Type');
		return;
	}

	var language = request.query.lang;
	if (!language) {
		sendError('GET', request.url, response, 'Invalid Language');
		return;
	}

	db.list(type, language, function (error, data) {
		if (error) {
			sendError('GET', request.url, response, 'Invalid Request');
			return;
		}

		response.send(JSON.stringify(data));
		console.log('200 GET', request.url);
	});

};
