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

exports.transform = function(data, attributes) {
  return createClassArray(separateClasses(buildJSONArray(data, attributes)));
};