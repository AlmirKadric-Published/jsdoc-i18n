define(function (require, exports, module) {
	var TextDiff = require('../../helpers/text-diff.js');

	require('style!./style.less');

	module.exports = function ($scope, $location, $routeParams, $sce, $q, $http) {
		$scope.type = $location.path().substring(1);

		$scope.languages = [];
		$scope.lang = $routeParams.lang;
		$scope.$watch('lang', function () {
			$location.search('lang', $scope.lang);
		});

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

		$scope.loadLanguages = function () {
			var deferred = $q.defer();

			$http({
				method: 'GET',
				url: '/language/list'
			}).then(function (response) {
				$scope.languages = response.data;
				if (!$scope.lang) {
					$scope.lang = $scope.languages[0];
				}

				deferred.resolve();
			}, function (response) {
				console.error('Error when loading language data:', response);
			});

			return deferred.promise;
		};

		/**
		 *
		 */
		$scope.loadItems = function () {
			$http({
				method: 'GET',
				url: '/item/list',
				params: { type: $scope.type, lang: $scope.lang }
			}).then(function (response) {
				$scope.data = response.data;
				$scope.dataCount = response.data.length;
				$scope.pageCurrent = 1;
			}, function (response) {
				console.error('Error when loading items data:', response);
			});
		};

		// Do initial when page is displayed
		$scope.loadLanguages().then($scope.loadItems);
	};
});
