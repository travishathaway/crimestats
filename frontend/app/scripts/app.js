'use strict';

/**
 * @ngdoc overview
 * @name crimestatsApp
 * @description
 * # crimestatsApp
 *
 * Main module of the application.
 */
angular
  .module('crimestatsApp', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'googlechart'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
