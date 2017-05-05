var db = require('../db.js');
var helpers = require('../helpers.js');
var sendError = helpers.sendError;
var readPostJSON = helpers.readPostJSON;

module.exports = function (request, response) {
	var type = request.query.type;
	if (!type) {
		sendError('POST', request.url, response, 'Invalid Type');
		return;
	}

	var language = request.query.lang;
	if (!language) {
		sendError('POST', request.url, response, 'Invalid Language');
		return;
	}

	var longname = request.query.longname;
	if (!longname) {
		sendError('POST', request.url, response, 'Invalid Longname');
		return;
	}

	readPostJSON(request, function (error, jsonData) {
		if (error || !jsonData.content) {
			sendError('POST', request.url, response, 'Invalid Post Data');
			return;
		}

		var content = jsonData.content;
		db.set(type, language, longname, content, function (error) {
			if (error) {
				sendError('POST', request.url, response, 'Invalid Post Data');
				return;
			}

			response.send(200);
			console.log('200 POST', request.url);
		});
	});
};
