/**
 *
 * @param method
 * @param url
 * @param response
 * @param error
 */
exports.sendError = function (method, url, response, error) {
	response.statusCode = 400;
	response.send(error);
	console.log('400', method, url);
};

/**
 *
 * @param request
 * @param cb
 */
exports.readPostJSON = function (request, cb) {
	var postData = '';
	request.on('data', function (chunk) {
		postData += chunk;
	});
	request.on('end', function () {
		var jsonData;
		try {
			jsonData = JSON.parse(postData);
		} catch (error) {
			return cb(error);
		}

		return cb(null, jsonData);
	});
};

/**
 *
 * @param defaultData
 * @param langData
 * @returns {Array}
 */
exports.overloadDefault = function (defaultData, langData) {
	var mangledData = [];

	defaultData.forEach(function (itemDefault) {
		var useItem = itemDefault;
		for (var i = 0; i < langData.length; i += 1) {
			var itemLang = langData[i];
			if (itemLang.longname !== itemDefault.longname) {
				continue;
			}

			// If lang item found, use it and remove it from the list
			// This will speed up future searches
			useItem = itemLang;
			langData.splice(i, 1);
		}

		mangledData.push(useItem);
	});

	return mangledData;
};
