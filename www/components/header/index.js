define(function (require, exports, module) {
	var routes = require('../../routes.js');

	require('style!./style.less');

	module.exports = function (app) {
		//
		app.directive('appHeader', function () {
			return { template: require('text!./index.html') };
		});

		//
		app.controller('Header', function ($scope, $location) {
			//
			$scope.routes = routes.urls;
			$scope.routeActive = function (route) {
				return route === $location.path();
			};
		});
	};
});
