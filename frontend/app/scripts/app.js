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
    'mgcrea.ngStrap',
    'ui.slimscroll'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        controller: 'IndexCtrl',
        controllerAs: 'index'
      })
      .when('/offense-type', {
        templateUrl: 'views/offense_type.html',
        controller: 'OffenseTypeCtrl',
        controllerAs: 'offense_type'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
