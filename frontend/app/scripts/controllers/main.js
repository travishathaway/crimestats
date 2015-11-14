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
        var chart1 = {};
        chart1.type = "LineChart";
        chart1.data = data.results;
        chart1.cssStyle = "height:200px; width:300px;";
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
