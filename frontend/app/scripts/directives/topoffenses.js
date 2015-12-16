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
          scope.loading = true;
          var params = {
            neighborhood: scope.neighborhood,
            format: 'keyed'
          };

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
            var idx = scope.data['date'].length - 1;
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

          offensetype.get(params).then(function(data){
            scope.data = data.data;
            scope.setChartRows();
          }).finally(function(){
            scope.loading = false;
          });
        }
      }
    }
  ]);
