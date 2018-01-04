'use strict';
/**
 * Controller for userResource related functions
 * @author TJ Breese
 */

/**
 * Controller for logging in a user
 */
app.controller('loginController', ['$scope', '$timeout', '$location', 'userResource', 'authService', function($scope, $timeout, $location, userResource, authService) {
	/**
	 * Data model for the login form
	 */
	$scope.user = {
		email: null,
		password: null,
		error: false,
	};

	/**
	 * Process login request
	 */
	$scope.login = function() {
		// TODO: validation on the form
		userResource.login({ email: $scope.user.email, password: $scope.user.password },
			function(ret) {
				$location.path('/main');
			},
			function(ret) {
				$scope.user.error = ret.data.error;
			}
		);
	};
}]);

/**
 * Controller for handling new userResource signups
 */
app.controller('signupController', ['$scope', '$timeout', '$location', 'userResource', function($scope, $timeout, $location, userResource) {
	/**
	 * Data model for create userResource form
	 */
	$scope.user = {
		email: null,
		password: null,
		confirmPassword: null,
		error: false,
		alert: false,
	};

	/**
	 * Process the create account request
	 */
	$scope.signup = function() {
		// TODO: validation as much as we can in JS
		userResource.create({ email: $scope.user.email, password: $scope.user.password },
			function(ret) {
				$scope.user.alert = 'Account created successfully! You\'re being logged in now..';
				// wait 5 seconds and log the userResource in
				$timeout(function() {
					$location.path('/purchases');
				}, 5000);
			},
			function(ret) {
				
			}
		);
	};
}]);

/**
 * Controller for logging out the userResource
 */
app.controller('logoutController', ['$location', '$timeout', 'userResource', function($location, $timeout, userResource) {
	userResource.logout({},
		function() {
			// wait 5 seconds and then redirect to the login page
			$timeout(function() {
				$location.path('/login');
			}, 5000);
		}
	);
}]);