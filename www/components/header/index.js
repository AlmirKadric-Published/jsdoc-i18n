define(function (require, exports, module) {
	var routes = require('../../routes.js');

	require('style!./style.less');

	module.exports = function (app) {
		//
		app.directive('appHeader', function () {
			return { template: require('text!./index.html') };
		});

		//
		app.controller('Header', function ($scope, $location, $routeParams) {
			$scope.routes = routes.urls;

			$scope.lang = $routeParams.lang;
			$scope.$on('$routeChangeSuccess', function () {
				$scope.lang = $routeParams.lang
			});

			/**
			 *
			 * @returns {string}
			 */
			$scope.urlWithParams = function (url, lang) {
				var finalUrl = url;
				if (lang) {
					finalUrl += '?lang=' + encodeURIComponent(lang)
				}
				return finalUrl
			};

			/**
			 *
			 * @param route
			 * @returns {boolean}
			 */
			$scope.routeActive = function (route) {
				return route === $location.path();
			};
		});
	};
});
