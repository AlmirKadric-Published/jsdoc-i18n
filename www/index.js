require.config({
	config: {
		// Less plugin should load files relative to root
		style: { path: '.' }
	},
	paths: {
		// Configure RequireJS plugins to load from scripts folder
		'less': './assets/scripts/less-2.7.2.min',
		'style': './assets/scripts/require-less-0.9.2.min',
		'text': './assets/scripts/require-text-2.0.15.min'
	}
});

//
require([
	'./routes.js',
	'./components/contenteditable/index.js',
	'./components/header/index.js',
	'style!./style.less'
], function () {
	var routes = require('./routes.js');
	var angular = window.angular;

	// Our main application module
	var app = angular.module('app', ['ngRoute', 'ui.bootstrap', 'xeditable']);

	// Setup additional components
	require('./components/contenteditable/index.js')(app);
	require('./components/header/index.js')(app);

	// Setup routes for ngRoute module during bootstrap with default route
	app.config(function ($routeProvider) {
		routes.setupRoutes($routeProvider);
		$routeProvider.otherwise({ redirectTo: '/api' });
	});

	// Create start-from filter for pagination
	app.filter('startFrom', function () {
		return function (input, start) {
			if (!input) {
				return input;
			}

			return input.slice(parseInt(start));
		};
	});

	// Wait for the DOM
	angular.element(document).ready(function () {
		angular.bootstrap(document, ['app']);
	});
});
