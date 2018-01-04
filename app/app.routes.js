'use strict';
/**
 * Routing rules for the app
 * @author Tom Breese <thomasjbreese@gmail.com>
 */
app.config(function($routeProvider) {
	$routeProvider
		// maintain the default route such that we only ever have to change it HERE AND ONLY HERE
		.when('/main', {
			redirectTo: '/purchase/create',
		})
		.when('/purchases', {
			controller: 'recentPurchaseController',
			templateUrl: 'assets/views/purchase/recent.html',
			authorize: true,
		})
		.when('/purchase/create', {
			controller: 'createPurchaseController',
			templateUrl: 'app/components/purchase/views/create.html',
			authorize: true,
		})
		.when('/signup', {
			controller: 'signupController',
			templateUrl: 'app/components/user/views/create.html',
		})
		.when('/login', {
			controller: 'loginController',
			templateUrl: 'app/components/user/views/login.html',
		})
		.when('/logout', {
			resolve: { 
				logout: ['logoutService', function(logoutService) {
					logoutService();
				}]
			},
		})
		// handle a nomatch with a 404 page
		.otherwise({
			templateUrl: 'app/shared/partials/404.html',
		});
});

/**
 * Authentication valdiation checking on route changes
 */
app.run(['$rootScope', '$location', 'authService', function($rootScope, $location, authService) {
	$rootScope.$on('$routeChangeStart', function(event, destination, source) {
		var authorized = authService.isAuthorized();
        // check if the route requires authorization to access
        if (destination.authorize === true) {
        	// if we're not authorized, redirect to the login page
            if (!authorized) {
            	$location.path('/login');
            }
        } else if ($location.path() === '/login') {
        	// if the user is already logged in, redirect to main page
        	if (authorized) {
        		$location.path('/main');
        	}
        }
    });
}]);