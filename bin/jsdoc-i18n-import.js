#!/usr/bin/env node
'use strict';

var path = require('path');
var jsdoc = require('../lib/jsdoc.js');

// Setup JSDoc CLI and config system
jsdoc.setupJSDoc();

// Inject i18n configurations and force use of DB template
jsdoc.env.opts.i18n = jsdoc.env.conf.i18n;
jsdoc.env.opts.template = path.join(__dirname, '../lib/dbTemplate');

// Update i18n config from env opts
jsdoc.require('../lib/config').update(jsdoc.env.opts);

// Begin parsing files
jsdoc.cli.runCommand(function (errorCode) {
	jsdoc.cli.logFinish();
	jsdoc.cli.exit(errorCode || 0);
});
