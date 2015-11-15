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
    'googlechart',
    'mgcrea.ngStrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
