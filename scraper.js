/* @flow */
'use strict';

// require needed libraries (cheerio for server side JQuery manipulation)

var monk = require('monk');
var utilities = require('./utilities.js');
var db, collection;
var selectors = require('./selectors.js');
var workerPools = require('./scraper_worker_pools.js');
var cheerio = require('cheerio');
var selectors = require('./selectors.js');

var term_to_collection = {};

function getTerms(body, callback) {
  console.log('Getting terms array');
  workerPools.TermsWorkerPool.run(body, function(data) {
    console.log('Finished getting terms');
    callback(null, data);
  });
}

function getSubjects(body, callback) {
  console.log('Getting subjects');
  workerPools.SubjectsWorkerPool.run(body, function(data) {
    console.log('Finished getting subjects');
    callback(null, data);
  });
}

function getCourses(body, callback) {
  workerPools.CoursesWorkerPool.run(body, function(data) {
    callback(null, data);
  });
}

function getClassData(body, callback) {
  workerPools.ScraperWorkerPool.run(body, function(data) {
    callback(null, data);
  });
}

function getSectionData(body, classData) {
  var $ = cheerio.load(body);
  var instructorData = null, finalData = null;

  $(selectors.properties.instructor).each(function() {
    if (this && this.children && this.children[0] && this.children[0].data) {
      instructorData = this.children[0].data.trim();
      return false;
    }
  });

  $(selectors.properties.finalData).each(function() {
   if (this && this.children && this.children[0] &&  this.children[0].data) {
      finalData = this.children[0].data.trim();
      return false;
    }
  });

  classData.instructor = instructorData;
  classData.final = finalData;
}

function generateJSON(term, subject, classDesc, classList) {
  var finalObj = {
    term: term,
    subject: subject, 
    classDesc: classDesc,
    classes: classList
  };

  if (collection && collection.insert) {
    collection.insert(finalObj, function(err, data) {
      if (err)
        console.log('Error inserting into database');
    });
  } else {
    console.log('Error!!!');
  }
}

/**
 * @param {string} term
 * @param {string} mongoURL
 * @return {any}
 */
module.exports = function(term, mongoURL) {
  db = monk(mongoURL);
  collection = db.get(term);

  return {
    getTerms: getTerms,
    getSubjects: getSubjects,
    getCourses: getCourses,
    getClassData: getClassData,
    getSectionData: getSectionData,
    generateJSON: generateJSON
  };
};
