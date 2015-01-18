/* @flow */
'use strict';

var cheerio = require('cheerio');
var utilities = require('./utilities.js');
var selectors = require('./selectors.js');

function checkCSSType(item) {
  return (item.type === 'tag' && item.name === 'option');
}

exports.getTerms = function getTerms(body) {
  var $ = cheerio.load(body);

  var terms = [];

  $(selectors.properties.terms).each(function() {
    if (checkCSSType(this)) {
      terms.push(this.attribs.value);
    } 
  });

  return terms;
}

exports.getSubjects = function getSubjects(body) {
  var $ = cheerio.load(body);

  var subjects = [];

  $(selectors.properties.subject).each(function() {
    if (checkCSSType(this)) {
      subjects.push(this.attribs.value);
    } 
  });

  return subjects;
}

exports.getCourses = function getCourses(body) {
  var $ = cheerio.load(body);

  var courses = [];

  $(selectors.properties.course).each(function() {
    if (checkCSSType(this)) {
      courses.push(this.attribs.value);
    } 
  });

  return courses;
}

exports.getClassData = function getClassData(body) {
  var $ = cheerio.load(body);

  var selectionData = [];

  for (var i = 0; i < selectors.selectionArr.length; i++) {
    selectionData.push([]);
  }

  for (var i = 0; i < selectors.selectionArr.length; i++) {
    $(selectors.selectionArr[i]).each(function() {
      if (this && this.children && this.children[0] && this.children[0].data) {
          selectionData[i].push(this.children[0].data.trim());
      }
    });
  }

  // O(n^2) running time
  var objArr = utilities.transform(selectionData, selectors.nameArr).map(function(elem) {
    return {
      data: elem,
      link: null
    };
  });

  var courseLinks = [];
  // get course links
  $('.dgdTemplateGrid').each(function() {
    var a = $(this).find('.dgdClassDataColumnIDNumber a').first();
    if (a && a[0] && a[0].type === 'tag') {
      courseLinks.push(a[0].attribs.href);
    }
  });

  for (var i = 0; i < objArr.length; i++) {
    objArr[i].link = courseLinks[i];
  }
  
  return objArr;
}
