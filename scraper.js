/* @flow */

// require needed libraries (cheerio for server side JQuery manipulation)

var cheerio = require('cheerio');
var monk = require('monk');
var utilities = require('./utilities.js');
var db, collection;

// attribute list
var nameArr = [
  { name: 'dataType', type:'string' },
  { name: 'sectionNumber', type:'string' },
  { name: 'days', type:'string' },
  { name: 'timeStart', type:'string' },
  { name: 'timeEnd', type:'string' },
  { name: 'building', type:'string' },
  { name: 'room', type:'string' },
  { name: 'restrict', type:'string' },
  { name: 'enrollTotal', type:'integer' },
  { name: 'enrollCap', type:'integer' },
  { name: 'waitTotal', type:'integer' },
  { name: 'waitCap', type:'integer'},
  { name: 'status', type:'string'}
];

// jQuery selections to fill class data
var selectionArr = [
  '.dgdClassDataActType span',
  '.dgdClassDataSectionNumber span',
  '.dgdClassDataDays span',
  '.dgdClassDataTimeStart span',
  '.dgdClassDataTimeEnd span',
  '.dgdClassDataBuilding span',
  '.dgdClassDataRoom span',
  '.dgdClassDataRestrict span',
  '.dgdClassDataEnrollTotal span',
  '.dgdClassDataEnrollCap span',
  '.dgdClassDataWaitListTotal span',
  '.dgdClassDataWaitListCap span',
  '.dgdClassDataStatus span'
];

var properties = {
  subject: '#ctl00_BodyContentPlaceHolder_SOCmain_lstSubjectArea option',
  course: '#ctl00_BodyContentPlaceHolder_crsredir1_lstCourseNormal option',
  instructor: '#ctl00_BodyContentPlaceHolder_subdet_lblInstructor',
  finalData: '#ctl00_BodyContentPlaceHolder_subdet_lblFinalExam',
  terms: '#ctl00_BodyContentPlaceHolder_SOCmain_lstTermDisp option'
};

function checkCSSType(item) {
  return (item.type === 'tag' && item.name === 'option');
}

function getTerms(body, callback) {
  var $ = cheerio.load(body);

  $(properties.terms).each(function() {
    if (checkCSSType(this)) {
      callback(null, this.attribs.value); // return term
    } else {
      callback(new Error('Check CSS type failed in getTerms()'));
    }
  });
}

function getSubjects(body, callback) {
  var $ = cheerio.load(body);

  $(properties.subject).each(function() {
    if (checkCSSType(this)) {
      callback(null, this.attribs.value); // return subject
    } else {
      callback(new Error('Check CSS type failed in getSubjects()'));
    }
  });
}

function getCourses(body, callback) {
  var $ = cheerio.load(body);

  $(properties.course).each(function() {
    if (checkCSSType(this)) {
      callback(null, this.attribs.value); // return class description
    } else {
      callback(new Error('Check CSS type failed in getCourses()'));
    }
  });
}

function getClassData(body, callback) {
  var $ = cheerio.load(body);

  var selectionData = [];

  for (var i = 0; i < selectionArr.length; i++) {
    selectionData.push([]);
  }
  for (var i = 0; i < selectionArr.length; i++) {
    $(selectionArr[i]).each(function () {
      if (this && this.children && this.children[0] && this.children[0].data) {
          selectionData[i].push(this.children[0].data.trim());
      }
    });
  }

  // O(n^2) running time
  var objArr = utilities.transform(selectionData, nameArr);

  var courseLinks = [];
  // get course links
  $('.dgdTemplateGrid').each(function() {
    var a = $(this).find('.dgdClassDataColumnIDNumber a').first();
    if (a && a[0] && a[0].type === 'tag') {
      courseLinks.push(a[0].attribs.href);
    }
  });
  callback(null, objArr, courseLinks);
}

function getSectionData(body, classData) {
  var $ = cheerio.load(body);
  var instructorData = null, finalData = null;

  $(properties.instructor).each(function() {
    if (this && this.children && this.children[0] && this.children[0].data) {
      instructorData = this.children[0].data.trim();
      return false;
    }
  });

  $(properties.finalData).each(function() {
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
