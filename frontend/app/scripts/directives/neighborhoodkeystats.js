'use strict';

/**
 * @ngdoc directive
 * @name crimestatsApp.directive:neighborhoodKeyStats
 * @description
 * # neighborhoodKeyStats
 */
angular.module('crimestatsApp')
  .directive('neighborhoodKeyStats', [
    'offensetype',
    function (offensetype) {
      return {
        scope: {
          neighborhood: '='
        },
        templateUrl: 'views/directives/neighborhood_key_stats.html',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          var params = {
            neighborhood: scope.neighborhood,
            format: 'keyed'
          };

          scope.all_field = "All";
          scope.date_field = "date";
          scope.data = {};

          scope.setAverageOffenseCount = function(){
            var total = 0;
            var all_col = scope.data[scope.all_field];

            for( var x = 0; x < all_col.length; x++ ){
              total += all_col[x];
            }

            scope.average_offense_count = Math.round(total / all_col.length);
          }

          scope.setHighestOffenseCount = function(){
            var all_col = scope.data[scope.all_field];
            scope.highest_count = Math.max.apply(Math, all_col);
          }

          scope.setLowestOffenseCount = function(){
            var all_col = scope.data[scope.all_field];
            scope.lowest_count = Math.min.apply(Math, all_col);
          }

          scope.getOffenseCountYears = function(count){
            var years = [];
            var all_col = scope.data[scope.all_field];
            var date_col = scope.data[scope.date_field];
            var indexes = scope.getIndexes(all_col, count);

            for(var i = 0; i < indexes.length; i++){
              years.push(date_col[indexes[i]].substring(0, 4));
            }

            return years.join();
          }

          scope.getIndexes = function(array, val){
            var indexes = [], i;

            for(i = 0; i < array.length; i++){
              if (array[i] === val){
                indexes.push(i);
              }
            }

            return indexes;
          }

          offensetype.get(params).then(function(data){
            scope.data = data.data;

            scope.setAverageOffenseCount();

            scope.setHighestOffenseCount();
            scope.highest_count_years = scope.getOffenseCountYears(scope.highest_count);

            scope.setLowestOffenseCount();
            scope.lowest_count_years = scope.getOffenseCountYears(scope.lowest_count);
          });
        }
      };
    }
  ]
);
