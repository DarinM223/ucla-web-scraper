/* @flow */
'use strict';

describe('Test getTerms', function(done) {
  var thread_code = require('threads');
  (function($) {
    $.ajax({
      type: 'GET',
      url: 'http://www.registrar.ucla.edu/schedule/schedulehome.aspx',
      success: function(data, textStatus, jqXHR) {
        thread_code.getTerms(data, function(err, data) {
          console.log(data);
          done();
        });
      }
    });
  })(jQuery);
});

describe('Test getSubjects', function(done) {
  var thread_code = require('threads');
  (function($) {
    $.ajax({
      type: 'GET',
      url: 'http://www.registrar.ucla.edu/schedule/schedulehome.aspx',
      success: function(data, textStatus, jqXHR) {
        thread_code.getSubjects(data, function(err, data) {
          console.log(data);
          done();
        });
      }
    });
  })(jQuery);
});

describe('Test getCourse', function(done) {
  var thread_code = require('threads');
  (function($) {
  })(jQuery);
  done();
});

describe('Test getClassData', function(done) {
  var thread_code = require('threads');
  (function($) {
  })(jQuery);
  done();
});
