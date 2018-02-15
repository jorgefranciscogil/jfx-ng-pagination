angular.module('app',['jfx-ng-pagination'])
.config([function(){

}])
.run([function(){

}])
.controller('appCtrl', ['$scope', '$q', function($scope, $q){

	$scope.pagination = {
		page : 1,
		limit : 10,
		records: 400
	};
	
	$scope.beforeChangePage = function(){ var deferred = new $q.defer();
		if(confirm("¿Do you want to change page?"))
			deferred.resolve();
		else 
			deferred.reject();
		return deferred.promise;
	};

	$scope.pageChanged = function(page){
		console.log('¡Page changed!', page);
	};

}]);