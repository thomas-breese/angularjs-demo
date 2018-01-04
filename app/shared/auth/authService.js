/**
 * Authentication service and interceptor to handle injecting and parsing JWT
 * @author Tom Breese <thomasjbreese@gmail.com>
 */
angular.module('auth-service', ['auth-service'])
	.factory('authService', ['$window', function($window) {
		var authService = {};

		/**
		 * Parses JWT token from the server
		 * @param  {string} token JWT token
		 * @return {JSON}       parsed token object
		 */
		authService.parseJwt = function(token) {
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			return JSON.parse($window.atob(base64));
		};

		/**
		 * Store the current JWT token locally
		 * @param  {string} token JWT token
		 * @return {void}
		 */
		authService.saveToken = function(token) {
			$window.localStorage['jwtToken'] = token;
		};

		/**
		 * Return the current token
		 * @return {string} locally stored authentication token
		 */
		authService.getToken = function() {
			return $window.localStorage['jwtToken'];
		};

		/**
		 * Returns whether or not an active token is stored locally
		 * @return {Boolean} whether or not the user is logged in
		 */
		authService.isAuthorized = function() {
			var token = authService.getToken();
			if (token) {
				var params = authService.parseJwt(token);
				return Math.round(new Date().getTime() / 1000) <= params.exp;
			} else {
				return false;
			}
		};

		/**
		 * Remove local storage token
		 */
		authService.logout = function() {
			$window.localStorage.removeItem('jwtToken');
		};

		return authService;
	}]);

/**
 * Sets authorization header on each request and automatically saves the token when provided in the response
 */
angular.module('auth-interceptor', ['auth-interceptor'])
	.factory('authInterceptor', ['authService', 'API', function(authService, API) {
		return {
			// automatically attach Authorization header
			request: function(config) {
				var token = authService.getToken();
				if(config.url.indexOf(API) === 0 && token) {
					config.headers.Authorization = 'Bearer ' + token;
				}
				return config;
			},

			// If a token was sent back, save it
			response: function(res) {
				if (res.config.url.indexOf(API) === 0 && res.headers()['authorization']) {
					authService.saveToken(res.headers()['authorization']);
				}
				return res;
			}
		};
	}]);

/**
 * Service to log out a user
 */
angular.module('logout-service', ['logout-service'])
	.factory('logoutService', ['authService', '$location', function(authService, $location) {
		return function() {
			authService.logout();
			$location.path('/login');
		}
	}]);