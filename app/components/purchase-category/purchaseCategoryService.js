'use strict';

/**
 * Resource for interracting with server side purchase methods
 */
angular.module('purchase-category-resource', ['ngResource'])
	.factory('purchaseCategoryResource', ['$resource', 'API', function($resource, API) {
		return $resource(API+'purchase/category/:action/:param/:param1/:param2/:param3', {},
		{
			get: { method: 'GET' },
    	})
	}]);