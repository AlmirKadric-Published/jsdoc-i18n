#!/usr/bin/env node
'use strict';

var path = require('path');
var jsdoc = require('../lib/jsdoc.js');

// Setup JSDoc CLI and config system
jsdoc.setupJSDoc();

// Inject i18n configurations
jsdoc.env.opts.i18n = jsdoc.env.conf.i18n;

// Update i18n config from env opts
jsdoc.require('../lib/config').update(jsdoc.env.opts);

// Start tool server
jsdoc.require('../lib/server');
