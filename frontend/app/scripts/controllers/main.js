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
    '$scope', 
    '$http', 
    '$routeParams',
    '$templateCache',
    'olHelpers',
    'olData',
    function ($scope, $http, $routeParams, $templateCache, olHelpers, olData) {
      /**
       * These are all of the available census_tract data files we have available
       */
      $scope.geojson_file_choices = {
          2004: 'geojson/census_tracts_2004.json',
          2005: 'geojson/census_tracts_2005.json',
          2006: 'geojson/census_tracts_2006.json',
          2007: 'geojson/census_tracts_2007.json',
          2008: 'geojson/census_tracts_2008.json',
          2009: 'geojson/census_tracts_2009.json',
          2010: 'geojson/census_tracts_2010.json',
          2011: 'geojson/census_tracts_2011.json',
          2012: 'geojson/census_tracts_2012.json',
          2013: 'geojson/census_tracts_2013.json',
          2014: 'geojson/census_tracts_2014.json',
      }

      $scope.offense_types_file = 'geojson/offense_types.json';

      $scope.offense_types = ['All'];

      $scope.current_offense_type = 'All';

      /**
       * Start with the default year of 2004
       */
      $scope.geojson_file = $scope.geojson_file_choices[2004];

      /**
       * These are the available fields we have for setting the choropleth
       * values.
       */
      $scope.choropleth_field_choices = {
        report_density: 'Report Density',
        report_absolute: 'Absolute Report',
        report_per_person: 'Reports per Person'
      }

      $scope.choropleth_field_scales = {
        report_density: [
          '0 to 250',
          '250 to 500',
          '500 to 1000',
          '1000 to 2000',
          'greater than 2000'
        ],
        report_absolute: [
          '0 to 200',
          '200 to 400',
          '400 to 600',
          '600 to 800',
          'greater than 800'
        ],
        report_per_person: [
          '0 to 0.05',
          '0.05 to 0.1',
          '0.1 to 0.15',
          '0.15 to 0.2',
          'greater than 0.2'
        ]
      }

      /**
       * Our choropleth colors
       */
      $scope.choropleth_colors = [
          { color: '#ffffb2' },
          { color: '#fecc5c' },
          { color: '#fd8d3c' },
          { color: '#f03b20' },
          { color: '#bd0026' }
      ];

      /**
       * Our initial value for the choropleth map
       */
      $scope.choropleth_field = 'report_density';

      $scope.getChoroplethScaleText = function($index){
        return $scope.choropleth_field_scales[$scope.choropleth_field][$index];
      };

      /*
       * Page title
       */
      $scope.title = 'Map of Population and Crime Reports in Portland, OR';

      $scope.portland_center = {
        lat: 45.533452,
        lng: -122.6,
        lon: -122.65,
        zoom: 11.5,
      };

      var sourceTemplate = {
          type: 'GeoJSON',
          geojson: {
              object: {}
          }
      };

      /**
       * Cache object to avoid multiple requests
       */
      $scope.geojson_cache = {};

      $scope.updateMap = function(geojson_file){
        var data = $scope.geojson_cache[geojson_file];
        var cur_layer = angular.copy($scope.layers[0]);

        if( data !== undefined){
          $scope.layers.splice(0, 1)

          cur_layer.source = angular.copy(sourceTemplate);
          cur_layer.source.geojson.object = data;
          cur_layer.style = $scope.color_func_mappers[$scope.choropleth_field];
          $scope.layers.push(cur_layer);

        } else {
          $http(
              {url: geojson_file, method: 'GET'}
          ).success(function(data, status){
            $scope.geojson_cache[geojson_file] = data;
            
            $scope.layers[0].source = angular.copy(sourceTemplate);
            $scope.layers[0].source.geojson.object = data;
            $scope.layers[0].style = $scope.color_func_mappers[$scope.choropleth_field];
          });
        }
      };

      $scope.slideStopCallBack = function($event, value){
        var geojson_file = $scope.geojson_file_choices[value];

        if(geojson_file !== undefined){
          $scope.updateMap(geojson_file);
        }
      };

      // From low to high (light to dark)
      var choropleth_colors = [
        '#ffffb2',
        '#fecc5c',
        '#fd8d3c',
        '#f03b20',
        '#bd0026'
      ];

      var getChoroplethVal = function(value, colors, breaks){
        if( value <= 0){
          return '#FFFFFF';
        }

        for(var x = 0; x < colors.length; x++){
          if( x == 0 ){
            if(value > breaks[x] && value < breaks[x + 1]){
              return colors[x];
            }
          } else if( (x + 1) == colors.length ){
            if( value >= breaks[x] ){
              return colors[x];
            }
          } else {
            if( value >= breaks[x] && value < breaks[x + 1]){
              return colors[x];
            }
          }
        }
      }

      var getStyleObject = function(feature, breaks, dataFunc){
        var colorFunc = function(feature){
          if($scope.current_offense_type === 'All'){
            var count = feature.get('report_count');
          } else {
            var count = feature.get('report_count_by_offense')[$scope.current_offense_type];
            count = count ? count : 0;
          }

          if(dataFunc){
            var d = dataFunc(feature, count);
          } else {
            var d = count;
          }

          return getChoroplethVal(d, choropleth_colors, breaks);
        }

        var style = olHelpers.createStyle({
          fill: {
            color: colorFunc(feature),
            opacity: 0.4
          },
          stroke: {
            color: 'white',
            width: 3
          }
        });

        return [ style ];
      }

      var getStyleReportDensity = function(feature){

        var breaks = [0, 250, 500, 1000, 2000];

        return getStyleObject(feature, breaks, function(feature, count){
          return count / feature.get('sq_miles')
        });
      }

      var getStyleReportAbs = function(feature){
        var breaks = [0, 200, 400, 600, 800];

        return getStyleObject(feature, breaks);
      }

      var getStyleReportPerPerson = function(feature){
        var breaks = [0, 0.05, 0.1, 0.15, 0.2];

        return getStyleObject(feature, breaks, function(feature, count){
          return count / feature.get('pop10')
        });
      }

      $scope.color_func_mappers = {
        report_density: getStyleReportDensity,
        report_absolute: getStyleReportAbs,
        report_per_person: getStyleReportPerPerson
      }

      $scope.slider_opt = {
        year: 2004,
        min: 2004,
        max: 2014,
        step: 1
      }

      $scope.slider_value = 2004;

      $scope.current_census_tract_name = '';
      $scope.current_census_tract_pop = '';
      $scope.current_report_density = '';
      $scope.current_population_density = '';
      $scope.current_report_over_pop = '';

      $scope.defaults = {
        events: {
          layers: ['mousemove', 'click']
        }
      };

      $scope.base_layer = {
         name: 'Stamen',
         active: true,
         opacity: 0.35,
         index: -1,
         source: {
           type: 'Stamen',
           layer: 'toner'
         }
      };

      $scope.layers = [
        {
          name: 'census_tracts',
          source: {
            type: 'GeoJSON',
            url: $scope.geojson_file
          },
          style: $scope.color_func_mappers[$scope.choropleth_field],
          visible: true,
          opacity: 0.65,
        }
      ];

      $http.get($scope.offense_types_file).then(function(data){
        $scope.offense_types = $scope.offense_types.concat(data.data.offense_types);
      });

      var previousFeature; 

      $scope.$watch('choropleth_field', function(newVal, oldVal){
        if(newVal){
          if(newVal != oldVal){
            var geojson_file = $scope.geojson_file_choices[$scope.slider_value];

            $scope.updateMap(geojson_file);
          }
        }
      });

      $scope.$watch('current_offense_type', function(newVal, oldVal){
        if(newVal){
          if(newVal != oldVal){
            var geojson_file = $scope.geojson_file_choices[$scope.slider_value];

            $scope.updateMap(geojson_file);
          }
        }
      });

      $scope.$on('openlayers.layers.census_tracts.mousemove', function(event, feature, olEvent){
        var getStyle = $scope.color_func_mappers[$scope.choropleth_field];
        $scope.$apply(function(scope){
          scope.current_census_tract_name = feature.get('report_count');
          scope.current_census_tract_pop = feature.get('pop10');
          scope.current_report_density = feature.get('report_count') / feature.get('sq_miles');
          scope.current_population_density = feature.get('pop10') / feature.get('sq_miles');
          scope.current_census_tract_area = feature.get('sq_miles');
          scope.current_report_over_pop = feature.get('report_count') / feature.get('pop10');
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
    }
  ]
);
