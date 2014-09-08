var cluster = require('cluster');
var request = require('request');
var scraper = require('./scraper.js')('14F', 'localhost:27017/ucla');

function loadTerm(term) {
  request('http://www.registrar.ucla.edu/schedule/schedulehome.aspx', function(err, res, body) {
    if (!err && res.statusCode === 200) {
      scraper.getSubjects(body, function(err, subject) {
        var mySubject = subject.split(' ').join('+');
        var url = 'http://www.registrar.ucla.edu/schedule/crsredir.aspx?termsel=' + term + 
          '&subareasel=' + mySubject;
        request(url, function(err, res, body) {
          if (!err && res.statusCode === 200) {
            scraper.getCourses(body, function(err, classDesc) {
              var url = 'http://www.registrar.ucla.edu/schedule/detselect.aspx?termsel=' + term +
                '&subareasel=' + mySubject + '&idxcrs=' + 
                classDesc.split(' ').join('+');
              request(url, function(err, res, body) {
                if (!err && res.statusCode === 200) {
                  scraper.getClassData(body, function(err, classList, courseLink) {
                    request('http://www.registrar.ucla.edu/schedule/' + courseLink, function (err, res, body) {
                      if (!err && res.statusCode === 200) {
                        scraper.getSectionData(body, classList, function() {
                          scraper.generateJSON(term, subject, classDesc, classList);
                        });
                      }
                    });
                  });
                }
              });
            });
          }
        });
      });
    }
  });
}

if (cluster.isMaster) {
  loadTerm('14F');
}