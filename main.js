var cluster = require('cluster');
var request = require('request');
var scraper = require('./scraper.js')('14F', 'localhost:27017/ucla');

// array of workers
var clusterArr = [];
var currIndex = 0;

function getWorker(clusterArr) {
  if (clusterArr.length < 1) return null;

  var myWorker = clusterArr[currIndex];
  if (currIndex === clusterArr.length - 1) {
    currIndex = 0;
  } else {
    currIndex++;
  }
  return myWorker;
}

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

                // send task to worker
                var myWorker= getWorker(clusterArr);
                myWorker.worker.send({
                  url: url,
                  term: term,
                  subject: subject,
                  classDesc: classDesc
                });
                myWorker.tasks++;
                console.log('Adding task: ' + subject + classDesc + ' to worker ' + myWorker.worker.id);
            });
          }
        });
      });
    }
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

  for (var i = 0; i < clusterArr.length; i++) {
    (function(myCluster) {
      myCluster.worker.on('message', function(task) {
        myCluster.tasks--;
        console.log('Completed task for class ' + task.subject + task.classDesc);
      });
    }) (clusterArr[i]);
  }
}

if (cluster.isMaster) {
  generateClusters();
  console.log('Created ' + clusterArr.length + ' workers');
  loadTerm('14F');
} else {
  process.on('message', function(task) {
    if (task) {
      var url = task.url;
      var term = task.term;
      var subject = task.subject;
      var classDesc = task.classDesc;
      request(url, function(err, res, body) {
        if (!err && res.statusCode === 200) {

          scraper.getClassData(body, function(err, classList, courseLinks) {
            for (var i = 0; i < courseLinks.length; i++) {
              (function(i) {
                request('http://www.registrar.ucla.edu/schedule/' + courseLinks[i], function(err, res, body) {
                  if (!err && res.statusCode === 200) {
                    scraper.getSectionData(body, classList[i]);

                    if (i >= courseLinks.length - 1) {
                      scraper.generateJSON(term, subject, classDesc, classList);
                      process.send({ 
                        'subject': subject,
                        'classDesc': classDesc
                      });
                    }
                  }
                });
              })(i);
            }
          });
        }
      });
    }
  });
}