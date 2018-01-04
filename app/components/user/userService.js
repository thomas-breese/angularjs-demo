'use strict';
/**
 * Resource for interracting with server side user methods
 */
angular.module('user-resource', ['ngResource'])
	.factory('userResource', ['$resource', 'API', function($resource, API) {
		return $resource(API+'users/:action/:param/:param1/:param2/:param3', {},
		{
			login: { method: 'POST', params: { action: 'login' } },
			create: { method: 'POST', params: { action: 'create' } },
		});
	}]);