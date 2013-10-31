'use strict';

beforeEach(function() {
  this.addMatchers({
    toSelectNothing: function() {
      var api = this.actual;
      return  api.selected === {}
    }
  });
});
