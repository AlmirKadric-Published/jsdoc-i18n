define(function (require, exports, module) {
	var TextDiff = require('../../helpers/text-diff.js');

	require('style!./style.less');

	module.exports = function ($scope, $location, $sce, $q, $http) {
		$scope.type = $location.path().substring(1);
		$scope.lang = 'ja';

		$scope.data = [];
		$scope.dataCount = 0;
		$scope.pageCurrent = 1;
		$scope.pageSize = 10;

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
		 * @param longname
		 * @returns {string}
		 */
		$scope.editParams = function (longname) {
			return [
				'type=' + encodeURIComponent($scope.type),
				'lang=' + encodeURIComponent($scope.lang),
				'longname=' + encodeURIComponent(longname)
			].join('&');
		};

		/**
		 *
		 */
		$scope.load = function () {
			$http({
				method: 'GET',
				url: '/list',
				params: { type: $scope.type, lang: $scope.lang }
			}).then(function (response) {
				$scope.data = response.data;
				$scope.dataCount = response.data.length;
				$scope.pageCurrent = 1;
			}, function (response) {
				console.error('Error when loading data:', response);
			});
		};

		// Do initial when page is displayed
		$scope.load();
	};
});
