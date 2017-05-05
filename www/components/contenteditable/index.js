define(function (require, exports, module) {
	module.exports = function (app) {
		app.directive('contenteditable', function () {
			return {
				restrict: 'A',
				require: 'ngModel',
				link: function (scope, element, attributes, ngModel) {

					function read() {
						ngModel.$setViewValue(element.html());
					}

					ngModel.$render = function () {
						element.html(ngModel.$viewValue || "");
					};

					element.bind("keydown", function (event) {
						if (event.keyCode === 13) {
							// Make sure element html is already ending in a newline
							// This will preserve the cursor position
							var currentValue = element.html();
							var selectionRange = window.getSelection().getRangeAt(0);
							var caretAtEnd = selectionRange.endOffset === selectionRange.endContainer.length;
							if (caretAtEnd && currentValue[currentValue.length - 1] !== '\n') {
								document.execCommand('insertHTML', false, '\n');
							}

							// Insert newline instead of default div and br wrapping
							document.execCommand('insertHTML', false, '\n');
							event.preventDefault();
						}
					});

					element.bind("blur keyup change", function () {
						scope.$apply(read);
					});
				}
			};
		});
	};
});
