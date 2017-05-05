var path = require('path');

//
exports.defaultLang = 'en';

//
exports.dbPlugin = 'file';
exports.dbFilePath = './i18n';

//
exports.serverPort = 8080;
exports.serverCheckPaths = ['.', 'index.html', 'index.htm'];

/**
 *
 * @param conf
 */
exports.update = function (conf) {
	if (!conf.i18n) {
		return;
	}

	Object.keys(conf.i18n).forEach(function (key) {
		exports[key] = conf.i18n[key];
	});
};
