var fs = require('fs');
var path = require('path');
var config = require('../../config');
var helpers = require('../../helpers');

var defaultLang = config.defaultLang;
var dbFilePath = config.dbFilePath;


// List of queue contexts
// TODO: REPLACE THIS WITH SOME FORM OF ATOMIC FS LOCKING
var lockContexts = {};

/**
 *
 * @param context
 * @param cb
 */
function lock(context, cb) {
	// Make sure queue for context exists
	if (!lockContexts[context]) {
		lockContexts[context] = [];
	}

	// Add lock action to queue
	var queue = lockContexts[context];
	queue.push(cb);

	// Execute immediately if action is the first in the queue
	if (queue.length === 1) {
		process.nextTick(queue[0]);
	}
}

/**
 *
 * @param context
 */
function unlock(context) {
	// Make sure queue for context exists
	if (!lockContexts[context]) {
		lockContexts[context] = [];
	}

	// Remove current action from queue
	var queue = lockContexts[context];
	queue.shift();

	// Execute next action in queue
	if (queue.length > 0) {
		process.nextTick(queue[0]);
	}
}

/**
 *
 * @param {} file -
 * @param {} cb -
 * @returns {*}
 */
function readFileJSON(file, cb) {
	fs.readFile(file, function (error, data) {
		if (error) {
			return cb(error);
		}

		var jsonData;
		try {
			jsonData = JSON.parse(data);
		} catch (error) {
			return cb(error);
		}

		return cb(null, jsonData);
	});
}

/**
 *
 * @param file
 * @param jsonData
 * @param cb
 * @returns {*}
 */
function writeFileJSON(file, jsonData, cb) {
	var data;
	try {
		data = JSON.stringify(jsonData, null, 4);
	} catch (error) {
		return cb(error);
	}

	fs.writeFile(file, data, cb);
}

/**
 *
 * @param {} filesList -
 * @param {} [dataList] -
 * @param {} cb -
 * @returns {*}
 */
function readFilesJSON(filesList, dataList, cb) {
	if (typeof dataList === 'function') {
		cb = dataList;
		dataList = [];
	}

	if (filesList.length === 0) {
		return cb(null, dataList);
	}

	var file = filesList[0];
	readFileJSON(file, function (error, jsonData) {
		if (error) {
			return cb(error);
		}

		dataList.push(jsonData);
		readFilesJSON(filesList.slice(1), dataList, cb);
	});
}

/**
 *
 * @param type
 * @param language
 * @param cb
 */
exports.list = function (type, language, cb) {
	var defaultFile = defaultLang + '_' + type + '.json';
	var langFile = language + '_' + type + '.json';
	var fileList = [
		path.join(dbFilePath, defaultFile),
		path.join(dbFilePath, langFile)
	];

	readFilesJSON(fileList, function (error, dataList) {
		if (error) {
			return cb(error);
		}

		var items = [];
		var dataDefault = dataList[0];
		var dataLang = dataList[1];

		dataDefault.forEach(function (entryDefault) {
			var longname = entryDefault.longname;
			var found = false;

			// Ignore package entries
			if (entryDefault.kind === 'package') {
				return;
			}

			// Look for matching existing translation
			for (var i = 0; i < dataLang.length; i += 1) {
				var entryLang = dataLang[i];
				if (entryLang.longname !== longname) {
					continue;
				}

				// Mark as found
				found = true;

				items.push({
					longname: longname,
					contentWas: entryLang.contentWas,
					contentBecame: entryDefault.content,
					contentChanged: entryLang.hash !== entryDefault.hash,
					content: entryLang.content
				});

				// Remove for list to speedup future searches
				dataLang.splice(i, 1);

				// Found so break out of search loop
				break;
			}

			// Inject default entry if there was no existing translation for it
			if (!found) {
				items.push({
					longname: longname,
					contentWas: '',
					contentBecame: entryDefault.content,
					contentChanged: true,
					content: ''
				});
			}
		});

		return cb(null, items);
	});
};

/**
 *
 * @param type
 * @param language
 * @param longname
 * @param cb
 */
exports.get = function (type, language, longname, cb) {
	var defaultFile = defaultLang + '_' + type + '.json';
	var langFile = language + '_' + type + '.json';
	var fileList = [
		path.join(dbFilePath, defaultFile),
		path.join(dbFilePath, langFile)
	];

	readFilesJSON(fileList, function (error, dataList) {
		if (error) {
			return cb(error);
		}

		// Find default and language entries
		var i, entry, entryDefault, entryLang;
		var dataDefault = dataList[0];
		var dataLang = dataList[1];

		for (i = 0; i < dataDefault.length; i += 1) {
			entry = dataDefault[i];
			if (entry.longname === longname) {
				entryDefault = entry;
				break;
			}
		}

		for (i = 0; i < dataLang.length; i += 1) {
			entry = dataLang[i];
			if (entry.longname === longname) {
				entryLang = entry;
				break;
			}
		}

		// Make sure a default entry exists
		if (!entryDefault) {
			return cb(new Error('NoDefaultEntry'));
		}

		// Return required data
		var data = { longname: longname };
		if (entryLang) {
			data.isNew = false;
			data.content = entryLang.content;
			data.contentWas = entryLang.contentWas;
			data.contentBecame = entryDefault.content;
		} else {
			data.isNew = true;
			data.content = entryDefault.content;
			data.contentWas = '';
			data.contentBecame = entryDefault.content;
		}

		return cb(null, data);
	});
};

/**
 *
 * @param type
 * @param language
 * @param longname
 * @param content
 * @param cb
 * @returns {*}
 */
exports.set = function (type, language, longname, content, cb) {
	var lockContext = language + '_' + type;
	lock(lockContext, function () {
		var defaultFile = defaultLang + '_' + type + '.json';
		var langFile = language + '_' + type + '.json';
		var fileList = [
			path.join(dbFilePath, defaultFile),
			path.join(dbFilePath, langFile)
		];

		readFilesJSON(fileList, function (error, dataList) {
			if (error) {
				unlock(lockContext);
				return cb(error);
			}

			// Find default and language entries
			var i, entry, entryDefault, entryLang;
			var dataDefault = dataList[0];
			var dataLang = dataList[1];

			for (i = 0; i < dataDefault.length; i += 1) {
				entry = dataDefault[i];
				if (entry.longname === longname) {
					entryDefault = entry;
					break;
				}
			}

			for (i = 0; i < dataLang.length; i += 1) {
				entry = dataLang[i];
				if (entry.longname === longname) {
					entryLang = entry;
					break;
				}
			}

			// Make sure language entry exists
			if (!entryLang) {
				entryLang = entryDefault;
				dataLang.push(entryLang);
			}

			// Update language entry
			entryLang.contentWas = entryDefault.content;
			entryLang.hash = entryDefault.hash;
			entryLang.content = content;

			writeFileJSON(path.join(dbFilePath, langFile), dataLang, function (error) {
				unlock(lockContext);
				return cb(error);
			});
		});
	});
};

/**
 *
 * @param jsonApi
 * @param jsonTutorials
 */
exports.updateDefault = function (jsonApi, jsonTutorials) {
	var defaultApi = path.join(dbFilePath, defaultLang + '_api.json');
	var defaultTutorials = path.join(dbFilePath, defaultLang + '_tutorials.json');

	var dataApi = JSON.stringify(jsonApi, null, 4);
	var dataTutorials = JSON.stringify(jsonTutorials, null, 4);

	fs.writeFileSync(defaultApi, dataApi);
	fs.writeFileSync(defaultTutorials, dataTutorials);
};

/**
 *
 * @param language
 * @param cb
 */
exports.getLanguage = function (language, cb) {
	var apiDefault = defaultLang + '_api.json';
	var tutorialsDefault = defaultLang + '_tutorials.json';

	var apiLang = language + '_api.json';
	var tutorialsLang = language + '_tutorials.json';

	var filesList = [
		path.join(dbFilePath, apiDefault),
		path.join(dbFilePath, apiLang),
		path.join(dbFilePath, tutorialsDefault),
		path.join(dbFilePath, tutorialsLang)
	];

	readFilesJSON(filesList, function (error, dataList) {
		if (error) {
			return cb(error);
		}

		return cb(null, {
			api: helpers.overloadDefault(dataList[0], dataList[1]),
			tutorials: helpers.overloadDefault(dataList[2], dataList[3])
		});
	});
};