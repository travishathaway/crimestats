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
    'ui.slimscroll',
    'openlayers-directive'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        controller: 'IndexCtrl',
        controllerAs: 'index'
      })
      .when('/neighborhoods', {
        templateUrl: 'views/neighborhoods/list.html',
        controller: 'NeighborhoodListCtrl',
        controllerAs: 'neighborhood_list'
      })
      .when('/neighborhoods/:neighborhood*', {
        templateUrl: 'views/neighborhoods/view.html',
        controller: 'NeighborhoodViewCtrl',
        controllerAs: 'neighborhood_view'
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
