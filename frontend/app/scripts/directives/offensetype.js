'use strict';

/**
 * @ngdoc directive
 * @name crimestatsApp.directive:OffenseType
 * @description
 * # OffenseType
 */
angular.module('crimestatsApp')
  .directive('offenseType', ['$http', function ($http) {
    return {
      scope: {
        neighborhood: '='
      },
      templateUrl: 'views/directives/offense_type.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.reloadData = function(){
          if( scope.neighborhood == 'all'){
            var neighborhood = '';
          } else {
            var neighborhood = scope.neighborhood;
          }

          $http({url: '/api/crime_stats', params: {'neighborhood': neighborhood}}).success(function(data){
            scope.group_by_choices = {};
            scope.allChartData = {};
            scope.group_by_cols = data.cols;

            if($.isEmptyObject(scope.group_by_choices)){
              for(var x = 0; x < scope.group_by_cols.length; x++){
                var o_type = scope.group_by_cols[x];

                if($.inArray(o_type, data.cols) >= 0 && (x >= 0 && x < 3)){
                  scope.group_by_choices[o_type] = true;
                } else {
                  scope.group_by_choices[o_type] = false;
                }
              }
            }

            var rows = [];
            for(var x = 0; x < data.graph_data.rows.length; x++){
              var row;
              row = data.graph_data.rows[x];
              row.c[0].v = new Date(row.c[0].v);
              rows.push(row);
            }

            scope.allChartData = {};
            scope.allChartData.type = "LineChart";
            scope.allChartData.data = {
              cols: data.graph_data.cols,
              rows: rows
            };

            scope.allChartData.cssStyle = "height:500px; width: 100%";
            scope.allChartData.options = {
              "title": "Crime Incidents per month",
              "fill": 20,
              "displayExactValues": true,
              "hAxis": {
                "title": "Date"
              },
              "vAxis": {
                "title": "Incident Count"
              },
              'chartArea':{
                'width': '80%',
                'height': '80%'
              },
              'legend': {
                'position': 'bottom'
              }
            };

            scope.updateChart();
          })
        }

        scope.reloadData();

        scope.filterByDate = function(chartData){
          var start_date_pos;
          var end_date_pos;

          start_date_pos = scope.getDatePos($scope.start_date, chartData);
          end_date_pos = scope.getDatePos($scope.end_date, chartData);

          return scope.getChartDataSubset(
            start_date_pos, end_date_pos, chartData
          );
        }

        scope.getChartDataSubset = function(start_pos, end_pos, chartData){
          // Remove starting elements
          chartData.data.rows.splice(0, start_pos);

          // Remove ending elements
          chartData.data.rows.splice(end_pos, chartData.data.rows.length);

          return chartData;
        }

        scope.getDatePos = function(date, chartData){
          for(var x = 0; x < chartData.data.rows.length; x++){
            var year = chartData.data.rows[x].c[0].v.getYear();
            var month = chartData.data.rows[x].c[0].v.getMonth();

            if(date.getYear() == year && date.getMonth() == month){
              return x;
            }
          }
        }

        scope.filterColumns = function(chartData){
          var removeCols = scope.getNotSelectedCols();

          for(var x = 0; x < removeCols.length; x++){
            scope.removeField(removeCols[x], chartData);
          }

          return chartData;
        }

        scope.updateChart = function(){
          var chartData = angular.copy(scope.allChartData);
          chartData = scope.filterColumns(chartData);

          if(scope.start_date && $scope.end_date){
            chartData = scope.filterByDate(chartData);
          }

          var tableChart = angular.copy(chartData);
          tableChart.type = "Table";

          // Update charts
          scope.chart = chartData;
        }

        scope.getNotSelectedCols = function(){
          var notSelectedCols = [];

          angular.forEach(scope.group_by_choices, function(val, key){
            if(val === false){
              notSelectedCols.push(key);
            }
          });

          return notSelectedCols;
        }

        scope.removeField = function(column, chartData){
          var pos = scope.removeCol(column, chartData);
          scope.removeRows(pos, chartData);
        }

        scope.removeCol = function(column, chartData){
          var pos;

          for(var x = 0; x < chartData.data.cols.length; x++){
            if(chartData.data.cols[x].id === column){
              pos = x;
            }
          }

          chartData.data.cols.splice(pos, 1);
          return pos;
        }

        scope.removeRows = function(pos, chartData){
          for(var x = 0; x < chartData.data.rows.length; x++){
            chartData.data.rows[x].c.splice(pos, 1);
          }
        }
      }
    }
  }
  ]
);
