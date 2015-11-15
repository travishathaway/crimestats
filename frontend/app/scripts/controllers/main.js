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
    '$scope', '$http',
    function ($scope, $http) {
      $http.get('/api/crime_stats').success(function(data){
        var rows = [];
        for(var x = 0; x < data.results.rows.length; x++){
            var row;
            row = data.results.rows[x];
            row.c[0].v = new Date(row.c[0].v);
            rows.push(row);
        }

        var chart1 = {};
        chart1.type = "LineChart";
        chart1.data = {
            cols: data.results.cols,
            rows: rows
        };

        chart1.cssStyle = "height:500px; width: 100%";
        chart1.options = {
            "title": "Crime Incidents per month",
            "fill": 20,
            "displayExactValues": true,
            "hAxis": {
                "title": "Date"
            }
        };

        chart1.formatters = {};

        $scope.chart = chart1;
      })
    }
  ]
);
