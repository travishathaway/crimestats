'use strict';

/**
 * @ngdoc service
 * @name crimestatsApp.offensetype
 * @description
 * # offensetype
 * Service in the crimestatsApp.
 */
angular.module('crimestatsApp')
  .service('offensetype', [
    '$http',
    '$q',
    function ($http, $q) {
      var self = this;

      // Query URL
      this.url = '/api/crime_stats';

      // Cached query params
      this.query = {};

      // Fetched Data
      this.data = {};

      /* Method for getting the data
       *
       * If we already have the data for this query,
       * return a mock promise, else return the actual $http
       * promise object.
       */
      this.get = function(query){
        var format = query.format || 'default';
        var promise;

        if( angular.equals(self.query, query) && self.data[format] !== undefined) {
          self.query = query;

          var deferred = $q.defer();
          deferred.resolve(self.data[format])
          promise = deferred.promise;

        } else {
          promise = $http({'url': this.url, 'params': query}).then(function(data){
            self.data[format] = data;
            return data;
          })
        }

        return promise
      }

      return this;
    }
  ]
);
