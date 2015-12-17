'use strict';

/**
 * @ngdoc function
 * @name crimestatsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the crimestatsApp
 */
angular.module('crimestatsApp').controller(
  'HeaderCtrl', [
    '$scope',
    function ($scope) {
      $scope.menu = [
        {
          'display_name': 'Offense Types',
          'link': '#/offense-type'
        },
        {
          'display_name': 'About',
          'link': '#/about'
        }
      ];
    }
  ]
).controller(
  'NeighborhoodListCtrl', [
    '$scope', '$http',
    function($scope, $http){
      $http.get('/api/neighborhoods').success(
        function(data){
          $scope.data = data.data;
        }
      );

      $scope.mapquest = {
        source: {
            type: 'MapQuest',
            layer: 'osm'
        }
      };

      $scope.portland_center = {
        lat: 45.533452,
        lon: -122.65,
        zoom: 11.5
      };

      $scope.neighborhoods_layer = {
        name: 'portland_neighborhoods',
        source: {
            type: 'GeoJSON',
            url: 'geojson/neighborhoods.geojson'
        },
      };

      $scope.defaults = {
        events: {
          layers: [ 'mousemove', 'click' ]
        }
      };
    }
  ]
).controller(
  'NeighborhoodViewCtrl', [
    '$scope', '$routeParams', 'offensetype',
    function($scope, $routeParams, offensetype){
      $scope.neighborhood = $routeParams.neighborhood;
      $scope.offensetype = offensetype;
    }
  ]
).controller(
  'IndexCtrl', [
    '$scope', '$http', '$routeParams',
    function ($scope, $http, $routeParams) {
      $scope.title = 'Browse Neighborhood';
    }
  ]
);