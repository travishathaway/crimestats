'use strict';

describe('Directive: neighborhoodKeyStats', function () {

  // load the directive's module
  beforeEach(module('crimestatsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<neighborhood-key-stats></neighborhood-key-stats>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the neighborhoodKeyStats directive');
  }));
});
