'use strict';

var app = angular.module('spending', ['ngRoute', 'auth-interceptor', 'auth-service', 'logout-service', 'user-resource', 'spending-resource', 'ui.bootstrap', 'purchase-category-resource']);//, 'chart.js',]);
// set the API base url
app.constant('API', 'http://angular.localhost/api/');
// add the auth interceptor for request/responses
app.config(function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
});