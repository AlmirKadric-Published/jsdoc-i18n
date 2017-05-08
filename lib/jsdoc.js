'use strict';

var path = require('path');
var util = require('util');

// Special require funciton to resolve modules relative to jsdoc paths
var jsdocPath = path.dirname(require.resolve('jsdoc/cli.js'));
var jsdocRequire = require('requizzle')({
	infect: true,
	requirePaths: {
		before: [path.resolve(jsdocPath, 'lib')],
		after: [path.resolve(jsdocPath, 'node_modules')]
	}
});

// Core jsdoc libraries
var runtime = jsdocRequire('jsdoc/lib/jsdoc/util/runtime');
var env = jsdocRequire('jsdoc/lib/jsdoc/env');
var cli = jsdocRequire('jsdoc/cli');
var logger = jsdocRequire('jsdoc/lib/jsdoc/util/logger');


/**
 *
 */
exports.require = jsdocRequire;

/**
 *
 */
exports.runtime = runtime;

/**
 *
 */
exports.env = env;

/**
 *
 */
exports.cli = cli;

/**
 *
 */
exports.setupJSDoc = function () {
	// Setup JSDoc cli
	runtime.initialize([jsdocPath, process.cwd()]);

	cli.setVersionInfo();
	cli.loadConfig();

	if (!env.opts.test) {
		cli.configureLogger();
	}

	cli.logStart();

	if (env.opts.debug) {
		/**
		 * Recursively print an object's properties to stdout. This method is safe to use with
		 * objects that contain circular references.
		 *
		 * This method is available only when JSDoc is run with the `--debug` option.
		 *
		 * @global
		 * @name dump
		 * @private
		 * @param {...*} obj - Object(s) to print to stdout.
		 */
		global.dump = function() {
			console.log(jsdocRequire('jsdoc/lib/jsdoc/util/dumper').dump(arguments));
		};
	}
};

/**
 * Hack to force render from DB
 * TODO: See if JSDoc could refactor a bit to alleviate some of this hacker
 * @returns {*}
 */
exports.render = function () {
	var db = jsdocRequire('./db');
	var Promise = jsdocRequire('bluebird');
	var taffy = jsdocRequire('taffydb').taffy;
	var jsdocDoclet = jsdocRequire('jsdoc/lib/jsdoc/doclet');
	var jsdocPackage = jsdocRequire('jsdoc/lib/jsdoc/package');
	var jsdocTutorial = jsdocRequire('jsdoc/lib/jsdoc/tutorial');


	// Make sure language was provided when rendering
	if (!env.opts.i18n || !env.opts.i18n.language) {
		console.error('Must provide target -l --langauge option.\n');
		return Promise.resolve();
	}


	// HACK: inherit Doclet so we can attach properties before and after regular constructor is called
	function Doclet(comment, meta, before, after) {
		// Attach certain default properties which can't be extracted from comment and meta
		var beforeKeys = Object.keys(before);
		for (var i = 0; i < beforeKeys.length; i += 1) {
			var key = beforeKeys[i];
			this[key] = before[key];
		}

		// Call default Doclet constructor to re-parse comment and meta
		jsdocDoclet.Doclet.call(this, comment, meta);

		// Forcefully override certain properties that we don't want to be re-interpreted
		var afterKeys = Object.keys(after);
		for (var i = 0; i < afterKeys.length; i += 1) {
			var key = afterKeys[i];
			this[key] = after[key];
		}
	}
	util.inherits(Doclet, jsdocDoclet.Doclet);

	// HACK: inherit Package so we can attach files after regular constructor is called
	function Package(data) {
		jsdocPackage.Package.call(this, JSON.stringify(data));
		this.files = data.files;
	}
	util.inherits(Package, jsdocPackage.Package);


	// Load data from i18n database
	return Promise.fromCallback(function (callback) {
		db.getLanguage(env.opts.i18n.language, function (error, data) {
			if (error) {
				logger.fatal('Could not load i18n data from database', error);
				return Promise.resolve();
			}

			// Reconstruct doclet object list
			var doclets = [];
			data.api.forEach(function (entry) {
				if (entry.kind === 'package') {
					doclets.push(new Package(entry));
				} else {
					var docletSrc = entry.content;
					var meta = entry.meta || {};
					doclets.push(new Doclet(docletSrc, meta, {
						kind: entry.kind,

						preserveName: true,
						name: entry.name,
						longname: entry.longname,
						memberof: entry.memberof
					}, {

					}));
				}
			});
			var taffyData = taffy(doclets);

			// Reconstruct tutorial object tree
			var tutorialsRoot = new jsdocTutorial.RootTutorial();
			data.tutorials.forEach(function (data) {
				var childNode = new jsdocTutorial.Tutorial(data.name, data.content, data.type);
				tutorialsRoot.addChild(childNode);
				tutorialsRoot._addTutorial(childNode);
			});
			data.tutorials.forEach(function (data) {
				if (!data.children) {
					return;
				}

				var node = tutorialsRoot.getByName(data.name);
				data.children.forEach(function (childName) {
					var childNode = tutorialsRoot.getByName(childName);
					node.addChild(childNode);
				});
			});

			return callback(null, { api: taffyData, tutorials: tutorialsRoot });
		});
	}).then(function (data) {
		// TODO: we only need this since props in cli is not public, otherwise we could just set it and be done with it
		// Execute command
		if (env.opts.explain) {
			console.log(jsdocRequire('jsdoc/lib/jsdoc/util/dumper').dump(props.docs));
			return Promise.resolve();
		} else {
			var path = jsdocRequire('jsdoc/lib/jsdoc/path');

			var template;

			env.opts.template = (function() {
				var publish = env.opts.template || 'templates/default';
				var templatePath = path.getResourcePath(publish);

				// if we didn't find the template, keep the user-specified value so the error message is
				// useful
				return templatePath || env.opts.template;
			})();

			try {
				template = jsdocRequire(env.opts.template + '/publish');
			}
			catch (e) {
				logger.fatal('Unable to load template: ' + e.message || e);
			}

			// templates should include a publish.js file that exports a "publish" function
			if (template.publish && typeof template.publish === 'function') {
				logger.info('Generating output files...');
				var publishPromise = template.publish(
					data.api,
					env.opts,
					data.tutorials
				);

				return Promise.resolve(publishPromise);
			}
			else {
				logger.fatal(env.opts.template + ' does not export a "publish" function. Global ' +
				'"publish" functions are no longer supported.');
			}
			return Promise.resolve();
		}
	});
};
