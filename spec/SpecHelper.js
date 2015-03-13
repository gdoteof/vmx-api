/*globals  beforeEach: true, jasmine: true*/
beforeEach(function() {
  'use strict';

  var customMatchers = {
    toSelectNothing: function() {
      var api = this.actual;
      return  api.selected === {};
    }
  };

  jasmine.addMatchers(customMatchers);
});
