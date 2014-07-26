'use strict';

angular.module('fdApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider) {
    
    $routeProvider
      .when('/:alias', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'RedirectCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
