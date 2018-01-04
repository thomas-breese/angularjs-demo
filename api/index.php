<?php
/**
 * This is a dummy php file that just responds to the demo app api requests
 * @author Tom Breese <thomasjbreese@gmail.com>
 */
require(__DIR__.'/../vendor/autoload.php');

use \Firebase\JWT\JWT;
use \Tuupola\Base62;
use \Slim\Middleware\JwtAuthentication;

// Create and configure Slim app
$config = ['settings' => [
    'addContentLengthHeader' => false,
    'displayErrorDetails' => true,
]];
$app = new \Slim\App($config);

// enable JWT Tokens
$app->add(new JwtAuthentication([
    'secret' => "supersecretkeyyoushouldnotcommittogithub",
    'secure' => false,
    'path' => '/',
    'passthrough' => ['/users/create', '/users/login'],
    'algorithm' => 'HS256',
]));

// middlewear to just always return a token header for all requests
$addHeader = function($request, $response, $next) {
	$now = new DateTime();
	$future = new DateTime("now +2 hours");
	$jti = (new Base62)->encode(random_bytes(16));

	$payload = [
	    "jti" => $jti,
	    "iat" => $now->getTimeStamp(),
	    "nbf" => $future->getTimeStamp(),
	    "exp" => $future->getTimeStamp(),
	];

	$token = JWT::encode($payload, "supersecretkeyyoushouldnotcommittogithub", "HS256");
	$newResponse = $response->withHeader('Authorization', $token);
	return $next($request, $newResponse);
};
$app->add($addHeader);

/**
 * Users route groups
 */
$app->group('/users', function() use ($app) {

	// login route
	$app->post('/login', function($request, $response, $args) {
		return $response->withJson(['bananas' => 'this is a response from a login request.']);
	});

	// create account route
	$app->post('/create', function($request, $response, $args) {
		return $response->withJson(['this is a response from a create account request.']);
	});

});

// Run app
$app->run();