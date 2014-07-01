// require needed libraries (cheerio for server side JQuery manipulation)
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var cluster = require('cluster');
var monk = require('monk');
var db = monk('localhost:27017/ucla');
var collection = db.get('14F');

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

// builds JSON array from a list of lists containing the data
// @param data: a list of lists containing the data
// Ex. [ ['LEC', 'DIS', 'DIS']
//       ['1', '1A', '1B']
//       ......
//     ]
// @param attributes: a list of attribute objects containing name and type
// Ex. [ {name: 'dataType', type='string'},
//       {name: 'sectionNumber', type='string'},
//       .......
//     ]
// @return a list of JSON objects
// Ex. [ {
//          dataType: 'LEC',
//          sectionNumber: '1',
//       }
//       ......
//     ]
function buildJSONArray(data, attributes) {
    if (data.length < 1) return {};
    var jsonArr = [];
    for (var col = 0; col < data[0].length; col++) {
        var json = {};
        for (var row = 0; row < data.length; row++) {
            if (attributes[row].type === 'integer') {
                json[attributes[row].name] = parseInt(data[row][col], 10);
            } else {
                json[attributes[row].name] = data[row][col];
            }
        }
        jsonArr.push(json);
    }
    return jsonArr;
}

// separates classes based on lecture and discussion
// @param data: a list of JSON objects
// Ex. [ {
//          dataType: 'LEC',
//          sectionNumber: '1',
//       }
//       ......
//     ]
// @return a list of a list of JSON objects
// Ex. [ [ {
//            dataType: 'LEC',
//            sectionNumber: '1',
//            ....
//         }
//         {
//            dataTye: 'DIS',
//            sectionNumber: '1A',
//            ....
//         }
//       ]
//       [
//          {
//             .....
//          }
//          .....
//       ] ]
function separateClasses(data) {
    var retArr = [];
    for (var i = 0; i < data.length; i++) {
        // if not discussion, push new class array
        if (data[i].dataType !== 'DIS') {
            retArr.push([data[i]]);
        } else {
            // if discussion, try to push to existing lecture
            if (retArr.length > 0) {
                retArr[retArr.length - 1].push(data[i]);
            } else {
                retArr.push([data[i]]);
            }
        }
    }
    return retArr;
}

function createClassArray(data) {
    var retArr = [];
    for (var i = 0; i < data.length; i++) {
        retArr.push({classes: data[i]});
    }
    return retArr;
}

function findCourseInfo(index, courseLinks, classList, classDesc, subject, term, callback) {
    request('http://www.registrar.ucla.edu/schedule/' + courseLinks[index], function (err, res, body) {
        if (!err && res.statusCode === 200) {
            var $ = cheerio.load(body);
            var instructorData, finalData;
            (function (index) {
            async.parallel({
                    instructorData: function (callback) {
                        $('#ctl00_BodyContentPlaceHolder_subdet_lblInstructor').each(function () {
                            if (this && this.children && this.children[0] && this.children[0].data)
                                callback(null, this.children[0].data.trim());
                            else 
                                callback(err, null);
                        });
                    }, 
                    finalData: function (callback) {
                        $('#ctl00_BodyContentPlaceHolder_subdet_lblFinalExam').each(function () {
                            if (this && this.children && this.children[0] &&  this.children[0].data)
                                callback(null, this.children[0].data.trim());
                            else 
                                callback(err, null);
                        });
                    }
            }, function (err, results) {
                if (!err && classList && classList[index]) {
                    classList[index].instructor = results.instructorData;
                    classList[index].finalData = results.finalData;
                    if (index === courseLinks.length - 1) {
                        callback(classList, classDesc, subject, term);
                    } else {
                        findCourseInfo(index+1, courseLinks, classList, classDesc, subject, term, callback);
                    }
                }
            });
            })(index);
        } else {
            console.log('Error requesting course info');
        }
    });
}

function generateJSON(classList, classDesc, subject, term) {
    var finalObj = {};
    finalObj.term = term;
    finalObj.subject = subject;
    finalObj.classDesc = classDesc.trim();
    finalObj.classes = classList;
    collection.insert(finalObj, function (err, data) {
        if (err) {
            console.log("Error inserting into database!");
        } 
    });
    console.log("Added " + finalObj.subject + finalObj.classDesc);
}

// builds JSON based on classes
function onClassSelected(body, term, subject, classDesc) {
    var $ = cheerio.load(body);
    
    (function (classDesc, subject, term) {
    async.parallel({
            courseLinks: function (callback) {
                var courseLinks = [];
                $('.dgdTemplateGrid').each(function() {
                    var a = $(this).find('.dgdClassDataColumnIDNumber a').first();
                    if (a && a[0] && a[0].type === 'tag') 
                        courseLinks.push(a[0].attribs.href);
                });
                callback(null, courseLinks);
            },
            selectionData: function (callback) {
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
                callback(null, selectionData);
            }
    }, function (err, results) {
        if (!err) {
            var objArr = createClassArray(separateClasses(buildJSONArray(results.selectionData, nameArr)));
            findCourseInfo(0, results.courseLinks, objArr, classDesc, subject, term, generateJSON);
        }
    });
    }) (classDesc, subject, term);
}

function onSubjectSelected(body, term, subject) {
    var $ = cheerio.load(body);
    $('#ctl00_BodyContentPlaceHolder_crsredir1_lstCourseNormal option').each(function () {
        if (this.type === 'tag' && this.name === 'option') {
            var classDesc = this.attribs.value;
            url = 'http://www.registrar.ucla.edu/schedule/detselect.aspx?termsel=' + term +
                '&subareasel=' + subject.split(' ').join('+') + '&idxcrs=' + classDesc.split(' ').join('+');
            request(url, function (err, res, body) {
                if (!err && res.statusCode === 200) {
                    onClassSelected(body, term, subject, classDesc);
                } else {
                    console.log("ERROR!");
                }
            });
        } else {
            console.log("ERRRRROR");
        }
    });
}

function split(a, n) {
    var len = a.length,out = [], i = 0;
    while (i < len) {
        var size = Math.ceil((len - i) / n--);
        out.push(a.slice(i, i += size));
    }
    return out;
}
var clusterMap = {};
var dataArr = [];

function generateClusters(dataArr) {
    var cpuCount = require('os').cpus().length;
    // split work into arrays and tell each worker what to do
    var clusterArr = split(dataArr, cpuCount);
    for (var i = 0; i < cpuCount; i++) {
        worker = cluster.fork();
        worker.send({
                data: clusterArr[i]
        });
    }
}

if (cluster.isMaster) {
    request('http://www.registrar.ucla.edu/schedule/schedulehome.aspx', function (err, res, body) {
        if (!err && res.statusCode === 200) {
            $ = cheerio.load(body);
    
            var term = "14F";
            $('#ctl00_BodyContentPlaceHolder_SOCmain_lstSubjectArea option').each(function () {
                if (this.type === 'tag' && this.name === 'option') {
                    var subject = this.attribs.value;                 //// necessary!!
                    var mySubject = subject.split(' ').join('+');
                    var url = 'http://www.registrar.ucla.edu/schedule/crsredir.aspx?termsel=' + term + 
                        '&subareasel=' + mySubject;

                    dataArr.push({
                            'url': url,
                            'term': term,
                            'subject': subject,
                    });
                }
            });
            generateClusters(dataArr);
        } else {
            console.log('Main request failed');
        }
    });

} else {
    process.on('message', function (msg) {
        if (msg.data) {
            var myArray = msg.data;
            for (var i = 0; i < myArray.length; i++) {
                (function (data) {
                        request(data.url, function (err, res, body) {
                            if (!err && res.statusCode === 200) {
                                onSubjectSelected(body, data.term, data.subject);
                            }
                        });
                }) (myArray[i]);
            }
        }
    });
}
