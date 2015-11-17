'use strict';

/**
 * @ngdoc function
 * @name crimestatsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the crimestatsApp
 */
angular.module('crimestatsApp').controller(
  'MainCtrl', [
    '$scope', '$http', '$routeParams',
    function ($scope, $http, $routeParams) {
      $scope.group_by = $routeParams.group_by || 'major_offense_type';
      $scope.queryParams = {
        'group_by': $scope.group_by
      };
      $scope.group_by_titles = {
        'neighborhood': 'Neighborhood',
        'major_offense_type': 'Offense Type'
      }
      $scope.end_date_max = '';
      $scope.start_date_min = '';

      $scope.reloadData = function(){
        $http({url: '/api/crime_stats', params: $scope.queryParams}).success(function(data){
          $scope.group_by_choices = {};
          $scope.allChartData = {};
          $scope.group_by_cols = data.cols;

          if($.isEmptyObject($scope.group_by_choices)){
            for(var x = 0; x < $scope.group_by_cols.length; x++){
              var o_type = $scope.group_by_cols[x];

              if($.inArray(o_type, data.cols) >= 0 && x === 0){
                $scope.group_by_choices[o_type] = true;
              } else {
                $scope.group_by_choices[o_type] = false;
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

          $scope.allChartData = {};
          $scope.allChartData.type = "LineChart";
          $scope.allChartData.data = {
            cols: data.graph_data.cols,
            rows: rows
          };

          $scope.allChartData.cssStyle = "height:500px; width: 100%";
          $scope.allChartData.options = {
            "title": "Crime Incidents per month",
            "fill": 20,
            "displayExactValues": true,
            "hAxis": {
              "title": "Date"
            },
            "vAxis": {
              "title": "Incident Count"
            }
          };

          $scope.updateChart();
        })
      }

      $scope.reloadData();

      $scope.updateChart = function(){
        var chartData = angular.copy($scope.allChartData);
        var removeCols = $scope.getNotSelectedCols();

        for(var x = 0; x < removeCols.length; x++){
          $scope.removeField(removeCols[x], chartData);
        }

        $scope.chart = chartData;
        var tableChart = angular.copy(chartData);
        tableChart.type = "Table";
        $scope.tableChart = tableChart;
      }

      $scope.getNotSelectedCols = function(){
        var notSelectedCols = [];

        angular.forEach($scope.group_by_choices, function(val, key){
          if(val === false){
            notSelectedCols.push(key);
          }
        });

        return notSelectedCols;
      }

      $scope.removeField = function(column, chartData){
        var pos = $scope.removeCol(column, chartData);
        $scope.removeRows(pos, chartData);
      }

      $scope.removeCol = function(column, chartData){
        var pos;

        for(var x = 0; x < chartData.data.cols.length; x++){
          if(chartData.data.cols[x].id === column){
            pos = x;
          }
        }

        chartData.data.cols.splice(pos, 1);
        return pos;
      }

      $scope.removeRows = function(pos, chartData){
        for(var x = 1; x < chartData.data.rows.length; x++){
          chartData.data.rows[x].c.splice(pos, 1);
        }
      }
    }
  ]
);
