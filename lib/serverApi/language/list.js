var config = require('../../config');

module.exports = function (request, response) {
	response.send(JSON.stringify(config.possibleLang));
	console.log('200 GET', request.url);
};
