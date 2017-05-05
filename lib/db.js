var config = require('./config.js');

var plugin;
var dbPlugin = config.dbPlugin;

//
if (dbPlugin === 'file') {
	plugin = require('./dbPlugins/file');
} else {
	if (dbPlugin[0] === '.') {
		plugin = require(path.join(process.cwd(), dbPlugin));
	} else {
		plugin = require(dbPlugin);
	}
}

//
module.exports = plugin;
