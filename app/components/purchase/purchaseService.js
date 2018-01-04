'use strict';

/**
 * Resource for interracting with server side purchase methods
 */
angular.module('spending-resource', ['ngResource'])
	.factory('spendingResource', ['$resource', 'API', function($resource, API) {
		return $resource(API+'purchase/:action/:param/:param1/:param2/:param3', {},
		{
			getPurchaseCategories: { method: 'GET', params: { action: 'get_purchase_categories' } },
			createPurchase: { method: 'POST', params: { action: 'create' } },
			recentPurchases: { method: 'GET', params: { action: 'recent_purchases' } },
			history: { method: 'GET', params: { action: 'history' } },
			weeklyDetails: { method: 'GET', params: { action: 'weekly_details' } },
			getWeeklyTotal: { method: 'GET', params: { action: 'get_weekly_total' } },
			getPurchase: { method: 'GET', params: { action: 'get_purchase' } },
			editPurchase: { method: 'POST', params: { action: 'edit_purchase' } },
			deletePurchase: { method: 'DELETE', params: { action: 'delete_purchase' } },
    	})
	}]);