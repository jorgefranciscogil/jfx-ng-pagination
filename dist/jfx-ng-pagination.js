(function(){

	'use strict';
	var module_name = 'jfx-ng-pagination';
	var component = angular.module(module_name,[]);
	
	component
	.provider('jfxNgPagination',[
	function(){

		//FACTORY
		this.$get = function(){
			return {};
		};
		
	}])
	.directive('jfxNgPagination',[function(){
		return {
			restrict : 'E',
			replace : true,
			templateUrl : 'jfx-ng-pagination.tpl.html',
			scope : {
				currentPage : "=?",
				pageSize : "=",
				totalItems : "=",
				pagesDisplayed : "=?",
				beforeChange : "&?",
				pageChanged : "&",
				styleClass : "@?"
			},
			controller : ['$scope', '$location', '$window', '$timeout', '$q',
			function(s, $location, $window, $timeout, $q){
				//SCOPE
				s.currentPage = $location.search().page || 1;
				//SETTINGS
				s.numPages = 0;
				s.pages = [];
				s.auxItems = [];

				s.sidesSpaces = 2;
				s.pagesDisplayed = (function(pagesDisplayed){
					pagesDisplayed = pagesDisplayed < 5 ? 5 : 
										pagesDisplayed % 2 === 0 ? pagesDisplayed + 1 : pagesDisplayed;
					s.sidesSpaces = pagesDisplayed == 5 ? 1 : s.sidesSpaces;
					return pagesDisplayed;
				})(s.pagesDisplayed || 9);

				s.windowSize = s.pagesDisplayed - (s.sidesSpaces * 2);
				s.sideDelimits = Math.floor(s.windowSize / 2);
				s.split = false;

				if(!s.beforeChange)
				s.beforeChange = function(){ var deferred = new $q.defer();
					deferred.resolve();
					return deferred.promise;
				};

				s.styleClass = s.styleClass || 'jfx-ng-pagination jfx-ng-pagination-simple';

				s.createBeginPages = function(paginationWindow){
					var from = s.sidesSpaces, to = 1;
					paginationWindow.unshift(s.createItem(null, true, '...'));
					for(var i = from;i >= to;i--)
						paginationWindow.unshift(s.createItem(i));
					return paginationWindow;
				};

				s.createEndPages = function(paginationWindow){
					var from = s.numPages - s.sidesSpaces + 1, to = s.numPages;
					paginationWindow.push(s.createItem(null, true, '...'));
					for(var i = from;i <= to;i++)
						paginationWindow.push(s.createItem(i));
					return paginationWindow;
				};

				s.createBeginNavs = function(paginationWindow){
					paginationWindow.unshift(s.createItem(s.currentPage - 1, s.currentPage == 1, '<'));
					paginationWindow.unshift(s.createItem(1, s.currentPage == 1, '<<'));
				};

				s.createEndNavs = function(paginationWindow){
					paginationWindow.push(s.createItem(parseInt(s.currentPage) + 1, s.currentPage == s.numPages, '>'));
					paginationWindow.push(s.createItem(s.numPages, s.currentPage == s.numPages, '>>'));
				};

				s.createPaginationWindow = function(){

					var paginationWindow = [], beginPages = [], endPages = [], currentPage = parseInt(s.currentPage);
					
					if(!s.split) paginationWindow = s.createItems(1, s.numPages);
					else if(s.currentPage < (s.pagesDisplayed - s.sidesSpaces)){
						paginationWindow = s.createItems(1, s.pagesDisplayed - s.sidesSpaces);
						s.createEndPages(paginationWindow);
					}
					else if(s.currentPage >= (s.pagesDisplayed - s.sidesSpaces) && s.currentPage <= s.numPages - (s.pagesDisplayed - s.sidesSpaces) + 1){
						paginationWindow = s.createItems(currentPage - s.sideDelimits, currentPage + s.sideDelimits);
						s.createBeginPages(paginationWindow);
						s.createEndPages(paginationWindow);
					}
					else{
						paginationWindow = s.createItems(s.numPages - (s.pagesDisplayed - s.sidesSpaces) + 1, s.numPages);
						s.createBeginPages(paginationWindow);
					}

					s.createBeginNavs(paginationWindow);
					s.createEndNavs(paginationWindow);
					return paginationWindow;

				};

				s.createItem = function(value, disabled, text){
					return {
						number : value,
						url : disabled ? null : [$window.origin, ($window.location.hash ? '#' + $location.path() : $location.path()) + '?page=' + value].join('/'),
						text : text,
						disabled : disabled
					};
				};

				s.createItems = function(from, to){
					var items = [];
					for(var i = from;i <= to;i++)
						items.push(s.createItem(i));
					return items;
				};

				s.$watchGroup(['totalItems', 'pageSize'], function(totalItems){ if(!totalItems) return;
					
					s.pages = [];
					s.numPages = Math.ceil(s.totalItems / s.pageSize);
					s.split = s.numPages > s.pagesDisplayed;

					s.pages = s.createPaginationWindow();

				});

				s.endNgRepeat = function(){
					$timeout(function(){
						if(s.currentPage > s.numPages)
							$('ul.pagination li a.page-number').last().trigger('click');
					});
				};

				s.tryToChangePage = function(e, page){
					s.beforeChange()
					.then(function(){
						s.currentPage = page;
						s.pages = s.createPaginationWindow();
						s.pageChanged({page:s.currentPage});
					})
					.catch(function(){
						console.log("NOT CHANGE!!!");
					});
				};
			}]
		};
	}]);

})();
angular.module('jfx-ng-pagination').run(['$templateCache', function($templateCache) {$templateCache.put('jfx-ng-pagination.tpl.html','<nav aria-label="Page navigation"><ul ng-class=styleClass><li ng-repeat="page in pages" ng-class="{\'active\': page.number == currentPage && !page.text, \'disabled\': page.disabled}" ng-init="$last && endNgRepeat()"><a href=javascript: ng-click="!page.disabled && tryToChangePage($event, page.number);" ng-bind="page.text || page.number" ng-class="{\'page-number\' : !page.text}"></a></li></ul></nav>');}]);