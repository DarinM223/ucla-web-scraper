var cheerio = require('cheerio');
var utilities = require('./utilities.js');
var selectors = require('./selectors.js');

function getClassData(body) {
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

exports.getClassData = getClassData;
