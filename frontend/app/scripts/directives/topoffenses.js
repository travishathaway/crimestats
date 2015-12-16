'use strict';

/**
 * @ngdoc directive
 * @name crimestatsApp.directive:topOffenses
 * @description
 * # topOffenses
 */
angular.module('crimestatsApp')
  .directive('topOffenses', [
    '$filter',
    'offensetype',
    function ($filter, offensetype) {
      return {
        scope: {
          neighborhood: '=',
        },
        templateUrl: 'views/directives/top_offenses.html',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          var neighborhood;

          if( scope.neighborhood.toLowerCase() === 'all' ){
            neighborhood = '';
          } else {
            neighborhood = scope.neighborhood;
          }

          var params = {
            neighborhood: neighborhood,
            format: 'keyed'
          };

          // Initialize scope variables
          scope.loading = true;
          scope.years = [];

          scope.chart = {
            type: "BarChart",
            options: {
              isStacked: true,
              fill: 20,
              displayExactValues: true,
              chartArea: {
                width: "75%",
                height: "80%"
              },
              legend: {
                position: 'none'
              }
            },
            data: {
              cols: [
                {id: "t", label: "Offense Type", type: "string"},
                {id: "s", label: "Count", type: "number"}
              ]
            }
          };

          scope.setChartRows = function() {
            // Get the last index of the date list
            var idx = scope.data['date'].indexOf(scope.year);
            var top_offs = [];
            var rows = [];

            // Make an ordered list of offense types for a specific
            // year. Default is the last year.
            angular.forEach(scope.data, function(value, key){
              if( key !== 'date' && key !== 'All' ){
                top_offs.push({
                  type: key,
                  count: value[idx]
                });
              }
            });

            // Order the list
            top_offs = $filter('orderBy')(top_offs, '-count');

            // Pull the first five elements from the `top_offs` list
            // and put them in the special format for our chart
            // directive.
            for( var x = 0; x < 5; x++ ){
              rows.push({
                c: [
                   {v: top_offs[x].type},
                   {v: top_offs[x].count}
                ]
              });
            }

            scope.chart.data.rows = rows;
          };

          scope.setYearChoices = function(){
            var years = scope.data['date'];
            scope.year = years[years.length - 1];

            for(var x = 0; x < years.length; x++){
              var cur_year = years[x];

              scope.years[cur_year] = cur_year.substring(0, 4);
            }
          };

          scope.$watch('year', function(newVal, oldVal){
            if(newVal){
              if(newVal !== oldVal){
                scope.setChartRows();
              }
            }
          });

          offensetype.get(params).then(function(data){
            scope.data = data.data;
            scope.setYearChoices();
            scope.setChartRows();
          }).finally(function(){
            scope.loading = false;
          });
        }
      }
    }
  ]);
