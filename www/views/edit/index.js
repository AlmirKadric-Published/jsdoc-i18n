define(function (require, exports, module) {
	var TextDiff = require('../../helpers/text-diff.js');

	require('style!./style.less');

	module.exports = function ($scope, $routeParams, $sce, $http) {
		$scope.type = $routeParams.type;
		$scope.lang = $routeParams.lang;

		$scope.longname = $routeParams.longname;
		$scope.isNew = false;

		$scope.content = '';
		$scope.contentWas = '';
		$scope.contentBecame = '';

		//
		var textDiff = new TextDiff();

		/**
		 *
		 * @param was
		 * @param became
		 * @returns {string}
		 */
		$scope.diff = function (was, became) {
			//
			var diff = textDiff.main(was, became);
			textDiff.cleanupSemantic(diff);

			//
			var html = textDiff.prettyHtml(diff);
			return $sce.trustAsHtml(html);
		};

		/**
		 *
		 */
		$scope.save = function () {
			$http({
				method: 'POST',
				url: '/set',
				params: { type: $scope.type, lang: $scope.lang, longname: $scope.longname },
				data: { content: $scope.content }
			}).then(function (response) {
				// Data saved, go back to dashboard
			}, function (response) {
				console.error('Error when loading data:', response);
			});
		};

		/**
		 *
		 */
		$scope.reset = function () {
			$scope.load();
		};

		/**
		 *
		 */
		$scope.load = function () {
			$http({
				method: 'GET',
				url: '/get',
				params: { type: $scope.type, lang: $scope.lang, longname: $scope.longname }
			}).then(function (response) {
				var doclet = response.data;
				$scope.isNew = doclet.isNew;
				$scope.content = doclet.content;
				$scope.contentWas = doclet.contentWas;
				$scope.contentBecame = doclet.contentBecame;
			}, function (response) {
				console.error('Error when loading data:', response);
			});
		};

		//
		$scope.load();
	};
});
