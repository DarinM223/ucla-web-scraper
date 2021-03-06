/* @flow */

var cluster = require('cluster');
var request = require('request');
var scraper = require('./scraper.js')('14F', 'localhost:27017/ucla');
var async = require('async');

// array of workers
var clusterArr = [];
var currIndex = 0;

function getWorker(clusterArr) {
  if (clusterArr.length && clusterArr.length < 1) return null;

  var myWorker = clusterArr[currIndex];
  if (currIndex === clusterArr.length - 1) {
    currIndex = 0;
  } else {
    currIndex++;
  }
  return myWorker;
}

function loadTerm(term) {
  var requestSchedule = function(callback) {
    request('http://www.registrar.ucla.edu/schedule/schedulehome.aspx', function(err, res, body) {
      if (!err && res.statusCode === 200) {
        return callback(err, body);
      } 
      return callback((err === null ? new Error('Error sending request') : err));
    });
  };

  var getSubjects = function(body, callback) {
    scraper.getSubjects(body, function(err, subject) {
      var mySubject = subject.split(' ').join('+');
      var url = 'http://www.registrar.ucla.edu/schedule/crsredir.aspx?termsel=' + term +
        '&subareasel=' + mySubject;
      request(url, function(err, res, body) {
        if (!err && res.statusCode === 200) {
          return callback(err, subject, body);
        }
        return callback((err === null ? new Error('Error sending request') : err));
      });
    });
  };

  var getCourses = function(subject, body, callback) {
    scraper.getCourses(body, function(err, classDesc) {
      var mySubject = subject.split(' ').join('+');
      var url = 'http://www.registrar.ucla.edu/schedule/detselect.aspx?termsel=' + term +
        '&subareasel=' + mySubject + '&idxcrs=' + 
         classDesc.split(' ').join('+');

      // send task to worker
      var myWorker = getWorker(clusterArr);
      if (myWorker !== null && myWorker.worker !== null && 
          myWorker.worker.send !== null && myWorker.tasks !== null) {

        myWorker.worker.send({
          url: url,
          term: term,
          subject: subject,
          classDesc: classDesc
        });
        myWorker.tasks++;
        console.log('Adding task: ' + subject + classDesc + ' to worker ' + myWorker.worker.id);
        return callback(null);
      } else {
        console.log('Error!!!');
        return callback(new Error('Error with workers!'));
      }
    });
  };

  async.waterfall([
    requestSchedule,
    getSubjects,
    getCourses
  ], function(err) {
  });
}

// creates clusters and adds them to cluster array
function generateClusters() {
  var cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i++) {
    var worker = cluster.fork();

    clusterArr.push({
      tasks: 0,
      worker: worker
    });
  }

  var onCluster = function(myCluster) {
    myCluster.worker.on('message', function(task) {
      myCluster.tasks--;
      console.log('Completed task for class ' + task.subject + task.classDesc);
    });
  };

  for (var i = 0; i < clusterArr.length; i++) {
    onCluster(clusterArr[i]);
  }
}

function processData(answer) {
  var number = parseInt(answer, 10);
  if (number && number >= 0 && number <= termArray.length) {
    console.log('Saving term ' + termArray[number-1]);
    generateClusters();
    console.log('Created ' + clusterArr.length + ' workers');
    loadTerm(termArray[number-1]);
  } else {
    console.log(answer + ' is not a valid number');
  }
}

if (cluster.isMaster) {
  var termArray = [];
  request('http://www.registrar.ucla.edu/schedule/schedulehome.aspx', function(err, res, body) {
    if (!err && res.statusCode === 200) {
      scraper.getTerms(body, function(err, term) {
        termArray.push(term);
      });
      console.log('Enter the term you want to save: ');
      for (var i = 0; i < termArray.length; i++) {
        console.log((i+1) + ". " + termArray[i]);
      }
      process.stdin.resume();
      process.stdin.setEncoding('ascii');

      process.stdin.on('data', function(input) {
        processData(input);
      });
    }
  });
} else {
  process.on('message', function(task) {
    if (task) {
      var url = task.url;
      var term = task.term;
      var subject = task.subject;
      var classDesc = task.classDesc;

      var sendClassesRequest = function(callback) {
        request(url, function(err, res, body) {
          if (!err && res.statusCode === 200) {
            return callback(err, body);
          }
          return callback(new Error('Error sending request'));
        });
      };

      var getClassData = function(body, callback) {
        scraper.getClassData(body, function(err, classList) {
          return callback(err, classList);
        });
      };

      var handleClasses = function(classList, callback) {
        var handleCourse = function(course, callback) {
          request('http://www.registrar.ucla.edu/schedule/' + course.link, function(err, res, body) {
            if (!err && res.statusCode === 200) {
              scraper.getSectionData(body, course.data);
              return callback(err, course.data);
            }
            return callback((err === null ? new Error('Error sending request') : error));
          });
        };

        async.map(classList, handleCourse, function(err, classList) {
          scraper.generateJSON(term, subject, classDesc, classList);
          process.send({
            subject: subject,
            classDesc: classDesc
          });
          return callback(err);
        });
      };

      async.waterfall([
        sendClassesRequest,
        getClassData,
        handleClasses
      ], function(err) {
      });
    }
  });
}
