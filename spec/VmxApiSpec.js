'use strict';


describe("VmxApi", function() {
  var api;
  beforeEach(function() {
    api = new VmxApi();
  });

  it("should be able to double a number", function() {
    expect(api.dub(3)).toEqual(6);
    expect(api.dub(9)).toEqual(18);
  });



});
