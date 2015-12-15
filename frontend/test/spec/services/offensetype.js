'use strict';

describe('Service: offensetype', function () {

  // load the service's module
  beforeEach(module('crimestatsApp'));

  // instantiate service
  var offensetype;
  beforeEach(inject(function (_offensetype_) {
    offensetype = _offensetype_;
  }));

  it('should do something', function () {
    expect(!!offensetype).toBe(true);
  });

});
