/* @flow */
'use strict';

var WorkerPool = require('./workerpool.js');

var numTermsThreads = 1;
var numSubjectsThreads = 1;
var numCoursesThreads = 20;
var numClassDataThreads = 50;

var TermsWorkerPool = new WorkerPool(numTermsThreads, function() {
  importScripts('./thread_code_build.js');
  var thread_code = require('threads');

  this.addEventListener('message', function(event) {
    var termsArr = thread_code.getTerms(event.data);
    postMessage(termsArr);
  });
});

var SubjectsWorkerPool = new WorkerPool(numSubjectsThreads, function() {
  importScripts('./thread_code_build.js');
  var thread_code = require('threads');

  this.addEventListener('message', function(event) {
    var subjectsArr = thread_code.getSubjects(event.data);
    postMessage(subjectsArr);
  });
});

var CoursesWorkerPool = new WorkerPool(numCoursesThreads, function() {
  importScripts('./thread_code_build.js');
  var thread_code = require('threads');
    
  this.addEventListener('message', function(event) {
    var coursesArr = thread_code.getCourses(event.data);
    postMessage(coursesArr);
  });
});

var ScraperWorkerPool = new WorkerPool(numClassDataThreads, function() {
  importScripts('./thread_code_build.js');
  var thread_code = require('threads');

  this.addEventListener('message', function(event) {
    var objArr = thread_code.getClassData(event.data);
    postMessage(objArr);
  });
});

exports.TermsWorkerPool = TermsWorkerPool;
exports.SubjectsWorkerPool = SubjectsWorkerPool;
exports.CoursesWorkerPool = CoursesWorkerPool;
exports.ScraperWorkerPool = ScraperWorkerPool;
