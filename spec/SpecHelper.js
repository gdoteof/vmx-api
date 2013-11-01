/*globals  beforeEach: true*/
beforeEach(function() {
  'use strict';
  this.addMatchers({
    toSelectNothing: function() {
      var api = this.actual;
      return  api.selected === {};
    }
  });
});
