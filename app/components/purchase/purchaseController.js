'use strict';
/**
 * Controllers for spendingResource related functions
 * @author TJ Breese
 */

/**
 * Controller for the main view which displays purchases for the current week
 */
app.controller('recentPurchaseController', ['$scope', '$timeout', 'spendingResource', 'sharedPurchaseResource', 'authService', 'purchaseCategoryResource', function($scope, $timeout, spendingResource, sharedPurchaseResource, authService, purchaseCategoryResource) {
	// fetch the purchase categories
	purchaseCategoryResource.get({}, 
		function(ret) {
			$scope.purchaseCategories = ret.categories;
		}, 
		function(ret) {
			if (ret.error) {
				$scope.purchase.error = ret.error;
			} else {
				$scope.purchase.error = 'Failed to fetch purchase categories.';
			}
		});
	/**
	 * Fetch the recent purchases for the week
	 */
	spendingResource.recentPurchases(
		function(ret) {
			if (ret.status) {
				$scope.recentPurchases = ret.data;
			} else {
				$scope.error = ret.error;
			}
		}
	);

	/**
	 * Wraps around shared resource to open modal window to confirm delete and carry out the deletion
	 */
	$scope.deletePurchase = function(purchase) {
		var purchaseIndex = $scope.recentPurchases.purchases.indexOf(purchase);
		if (purchaseIndex > -1) {
			var modalInstance = sharedPurchaseResource.deletePurchase(purchase.purchase_id);
			// handle the callback
			modalInstance.result.then(function(result) {
				// only care about true as that occurs when the window is close on success
				if (result) {
					$scope.recentPurchases.weekly_total -= $scope.recentPurchases.purchases[purchaseIndex].amount;
					$scope.recentPurchases.purchases.splice(purchaseIndex, 1);
					$scope.alert = 'Successfully deleted purchase.';
				}
			});
		} else {
			$scope.error = 'That purchase was not found.';
		}
	};
}]);

/**
 * Controller for creating a new purchase
 */
app.controller('createPurchaseController', ['$scope', '$timeout', '$filter', 'spendingResource', 'purchaseCategoryResource', function($scope, $timeout, $filter, spendingResource, purchaseCategoryResource) {
	// fetch the purchase categories
	purchaseCategoryResource.get({}, 
		function(ret) {
			$scope.purchaseCategories = ret.categories;
			console.log(ret);
			$scope.initPurchase($scope.purchaseCategories);
		}, 
		function(ret) {
			$scope.purchaseCategories = [];
			$scope.initPurchase($scope.purchaseCategories);
			if (ret.error) {
				$scope.purchase.error = ret.error;
			} else {
				$scope.purchase.error = 'Failed to fetch purchase categories.';
			}
		});

	/**
	 * Data model for purchase form
	 */
	$scope.initPurchase = function(categories) {
		$scope.purchase = {
			date: false,
			category: categories[0],
			name: '',
			amount: 0.00,
			description: '',
			error: false,
			alert: false,
		};
	};

	/**
	 * action for submitting a new purchase
	 */
	$scope.savePurchase = function() {
		// TODO: validation
		console.log($scope.purchase);
		spendingResource.createPurchase(
			{
				date: $filter('date')($scope.purchase.date, 'yyyy-MM-dd'),
				name: $scope.purchase.name,
				description: $scope.purchase.description,
				amount: $scope.purchase.amount,
				category: $scope.purchase.category,
			},
			function(ret) {
				// branch on success or failure
				if (ret.status) {
					$timeout(function() {
						$scope.purchase.name = '';
						$scope.purchase.description = '';
						$scope.purchase.amount = 0.00;
						$scope.purchase.error = false;
						$scope.purchase.alert = 'Purchase recorded successfully.';
					});
				} else {
					// set the error
					$timeout(function() {
						$scope.purchase.error = ret.error;
					});
				}
			}
		);
	};
}]);

/**
 * Controller for editing an existing purchase
 */
app.controller('editPurchaseController', ['$scope', '$timeout', '$filter', '$routeParams', 'spendingResource', function($scope, $timeout, $filter, $routeParams, spendingResource) {
	/**
	 * Get the list of purchase categories
	 */
	spendingResource.getPurchaseCategories(
		function(ret) {
			if (ret.status) {
				$scope.purchaseCategories = ret.data;
			} else {
				$timeout(function() {
					$scope.error = ret.error;
				});
			}
		}
	);

	/**
	 * Fetch the purchase based on the supplied purchaseId get param
	 */
	spendingResource.getPurchase({ param: $routeParams.purchaseId },
		function(ret) {
			if (ret.status) {
				$scope.purchase = ret.data;
				var date = new Date($scope.purchase.date);
				// TODO: fix bug with strupid date zones
				$scope.purchase.date = new Date(date);
			} else {
				$scope.purchase.error = ret.error;
			}
		}
	);

	/**
	 * Save the edits to the purchase
	 */
	$scope.editPurchase = function() {
		console.log($scope.purchase);
		// format the date to be the appropriate format, ignoring time
		var tmpPurchase = angular.copy($scope.purchase);
		tmpPurchase.date = $filter('date')(tmpPurchase.date, 'MM/dd/yyyy');
		spendingResource.editPurchase({ purchase: tmpPurchase },
			function(ret) {
				if (ret.status) {
					$scope.purchase.alert = 'Purchase updated successfully.';
					// TODO: potentially auto redirect to previous page on success
				} else {
					$scope.purchase = {
						error: ret.error,
					};
				}
			}
		);
	};
}]);

/**
 * Controller for displaying weekly totals
 */
 app.controller('purchaseHistoryController', ['$scope', '$timeout', 'spendingResource', function($scope, $timeout, spendingResource) {
 	/**
 	 * Fetch the list of weekly purchase totals
 	 */
 	spendingResource.history({},
 		function(ret) {
 			if (ret.status) {
 				$scope.weeks = ret.data;
 			} else {
 				$scope.weeks = {
 					error: ret.error,
 				};
 			}
 		}
 	);
}]);


/**
 * Controller for displaying spendingResource totals for the week
 */
app.controller('weeklyDetailsController', ['$scope', '$timeout', '$routeParams', 'spendingResource', 'sharedPurchaseResource', function($scope, $timeout, $routeParams, spendingResource, sharedPurchaseResource) {
	/**
	 * Fetch the purchases for the week
	 */
	spendingResource.weeklyDetails({ param: $routeParams.week },
		function(ret) {
			if (ret.status) {
				$scope.details = ret.data;
				// add the chart data
				$scope.details.chartData = {data: [], labels: []};
				// format the data for the chart
				if ($scope.details.purchases.length) {
					var currentIndex = null;
					angular.forEach($scope.details.purchases, function(value, key) {
						// build up the array of categories
						currentIndex = $scope.details.chartData.labels.indexOf(value.category);
						if (currentIndex == -1) {
							$scope.details.chartData.labels.push(value.category);
							currentIndex = $scope.details.chartData.labels.length - 1;
							$scope.details.chartData.data[currentIndex] = parseFloat(value.amount);
						} else {
							// total the values for each category
							$scope.details.chartData.data[currentIndex] += parseFloat(value.amount);
						}
					});
				}
			} else {
				$scope.details = {
					error: ret.error,
				};
			}
		}
	);

	/**
	 * /**
	 * Wraps around shared resource to open modal window to confirm delete and carry out the deletion
	 */
	$scope.deletePurchase = function(purchase) {
		var purchaseIndex = $scope.details.purchases.indexOf(purchase);
		if (purchaseIndex > -1) {
			var modalInstance = sharedPurchaseResource.deletePurchase(purchase.purchase_id);
			// handle the callback
			modalInstance.result.then(function(result) {
				// only care about true as that occurs when the window is close on success
				if (result) {
					$scope.details.weekly_total -= $scope.details.purchases[purchaseIndex].amount;
					$scope.details.purchases.splice(purchaseIndex, 1);
					$scope.details.alert = 'Successfully deleted purchase.';
				}
			});
		} else {
			$scope.details.error = 'That purchase was not found.';
		}
	};
}]);