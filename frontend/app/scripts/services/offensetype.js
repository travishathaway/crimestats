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

      // Promises
      this.http_promises = {};

      /* Method for getting the data
       *
       * If we already have the data for this query,
       * return a mock promise, else return the actual $http
       * promise object.
       */
      this.get = function(params){
        params.format = params.format || 'default';
        var promise;
        var uniq_str = self.getUniqueParamsStr(params);

        // First we check if the data has been cached on the object
        if( self.data[uniq_str] !== undefined){
          var deferred = $q.defer();
          deferred.resolve(self.data[uniq_str])
          promise = deferred.promise;

          return promise;

        // After that, we see if there is currently a promise
        // for this data.
        } else if( self.http_promises[uniq_str] ){
          return self.http_promises[uniq_str];

        } else {
          self.http_promises[uniq_str] = $http({
            'url': this.url,
            'params': params
          }).then(function(data){
            self.data[uniq_str] = data;
            return data;
          });

          return self.http_promises[uniq_str];
        }
      };

      this.getUniqueParamsStr = function(params){
        var uniq_str = '';
        var ks = Object.keys(params);
        var srtd_ks = ks.sort();

        for( var x = 0; x < srtd_ks.length; x++ ){
          uniq_str += srtd_ks[x] + ':' + params[srtd_ks[x]];

          if( x !== srtd_ks.length ){
            uniq_str += '--';
          }
        }

        return uniq_str;
      };

      return this;
    }
  ]
);
