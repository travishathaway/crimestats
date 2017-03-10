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
        },
        {
          'display_name': 'Map',
          'link': '#/map'
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

      $scope.reports_layer = {
        name: 'reports',
        source: {
          type: 'GeoJSON',
          url: '/api/reports.geojson'
        },
        style: {
          image: {
            circle: {
              radius: 8,
              fill: {
                color: 'rgba(0, 0, 255, 0.6)'
              },
              stroke: {
                color: 'white',
                width: 3
              }
            }
          }
        }
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
).controller(
  'MapController', [
    '$scope', '$http', '$routeParams', 'olHelpers', 'olData',
    function ($scope, $http, $routeParams, olHelpers, olData) {
      $scope.title = 'Map of Population and Crime Reports';
      $scope.portland_center = {
        lat: 45.533452,
        lng: -122.65,
        lon: -122.60,
        zoom: 11.5
      };

      // Get the countries geojson data from a JSON
      $http.get("geojson/census_tracts.json").success(function(data, status) {
        angular.extend($scope, {
          geojson: {
            data: data,
            style: {
              fillColor: "green",
              weight: 2,
              opacity: 1,
              color: 'white',
              dashArray: '3',
              fillOpacity: 0.7
            }
          }
        });
      });

      var getColor = function(d){
        return d > 0 && d < 2000 ? '#CC0066' :
          d >= 2000 && d < 4000 ? '#993366' :
          d >= 4000 && d < 6000 ? '#990066' :
          d >= 6000 ? '#CC3399' :
              '#FFFFFF';
      }

      var getStyle = function(feature){
          var style = olHelpers.createStyle({
                fill: {
                    color: getColor(feature.get('pop10')),
                    opacity: 0.4
                },
                stroke: {
                    color: 'white',
                    width: 3
                }
            });
        return [ style ];
      }

      $scope.current_census_tract_name = '';
      $scope.current_census_tract_pop = '';

      $scope.defaults = {
        events: {
          layers: ['mousemove', 'click']
        }
      }

      $scope.census_tracts = {
        name: 'census_tracts',
        source: {
          type: 'GeoJSON',
          url: 'geojson/census_tracts.json'
        },
        style: getStyle,
        visible: true,
        opacity: 0.7
      }

      olData.getMap().then(function(map){
          var previousFeature; 
          $scope.$on('openlayers.layers.census_tracts.mousemove', function(event, feature, olEvent){
            $scope.$apply(function(scope){
              scope.current_census_tract_name = feature.get('namelsad10');
              scope.current_census_tract_pop = feature.get('pop10');
            });

            if (feature) {
              feature.setStyle(olHelpers.createStyle({
                fill: {
                    color: '#FFF'
                }
              }));

              if (previousFeature && feature !== previousFeature) {
                previousFeature.setStyle(getStyle(previousFeature));
              }

              previousFeature = feature;
            }
          });
      });
    }
  ]
);
