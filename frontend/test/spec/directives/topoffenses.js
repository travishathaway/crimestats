'use strict';

describe('Directive: topOffenses', function () {

  // load the directive's module
  beforeEach(module('crimestatsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<top-offenses></top-offenses>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the topOffenses directive');
  }));
});
