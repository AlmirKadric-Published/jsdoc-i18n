define(function(require, exports) {
	//
	var urls =
	exports.urls = {
		'/api': {
			template: require('text!./views/dashboard/index.html'),
			controller: require('./views/dashboard/index.js'),
			headerLabel: 'API'
		},
		'/tutorials': {
			template: require('text!./views/dashboard/index.html'),
			controller: require('./views/dashboard/index.js'),
			headerLabel: 'Tutorials'
		},
		'/edit': {
			template: require('text!./views/edit/index.html'),
			controller: require('./views/edit/index.js')
		}
	};


	//
	var setupRoute =
	exports.setupRoute = function ($routeProvider, routeUrl) {
		$routeProvider.when(routeUrl, urls[routeUrl]);
	};


	//
	exports.setupRoutes = function ($routeProvider) {
		Object.keys(urls).forEach(function (routeUrl) {
			setupRoute($routeProvider, routeUrl);
		});
	};
});
