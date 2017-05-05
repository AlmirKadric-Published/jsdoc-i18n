#!/usr/bin/env node
var jsdoc = require('../lib/jsdoc.js');

// Setup JSDoc CLI and config system
jsdoc.setupJSDoc();

// Inject i18n configurations
jsdoc.env.opts.i18n = jsdoc.env.conf.i18n;

// HACK to extract langauge option from arguments (not perfect, will wait for below result)
// TODO: See if JSDoc could refactor to alleviate some of this hackery
var langI = jsdoc.env.args.indexOf('-l');
if (langI < 0) {
	langI = jsdoc.env.args.indexOf('--langauge')
}
if (langI >= 0 && jsdoc.env.args.length > langI + 1) {
	jsdoc.env.opts.i18n.language = jsdoc.env.args[langI + 1];
}

// TODO: HACK to inject README and Package content
delete jsdoc.env.opts._;
jsdoc.cli.scanFiles();

// Update i18n config from env opts
jsdoc.require('../lib/config').update(jsdoc.env.opts);

// Hijack main action and execute cli action
jsdoc.cli.main = jsdoc.render;
jsdoc.cli.runCommand(function (errorCode) {
	jsdoc.cli.logFinish();
	jsdoc.cli.exit(errorCode || 0);
});
