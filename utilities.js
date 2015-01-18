/* @flow */
'use strict';

/**
 * @param data:
 * Ex. [ ['LEC', 'DIS', 'DIS' ]
 *       ['1', '1A', '1B']
 *       .....
 *     ]
 * @param attributes:
 * Ex. [ { name: 'dataType', type='string' },
 *       { name: 'sectionNumber', type='string' },
 *       ....
 *     ]
 * @return [
 *     {
 *        classes: [
 *          {
 *            dataType: 'LEC',
 *            sectionNumber: '1',
 *            ....
 *          },
 *          {
 *            dataType: 'DIS',
 *            sectionNumber: '1A',
 *            ....
 *          },
 *          {
 *            dataType: 'DIS',
 *            sectionNumber: '1B',
 *            ....
 *          }
 *        ]
 *     },
 *     .....
 * ]
 */
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
    if (json.dataType !== 'DIS') {
      jsonArr.push({ classes: [json] });
    } else {
      if (jsonArr.length > 0) {
        jsonArr[jsonArr.length-1].classes.push(json); 
      } else {
        jsonArr.push({ classes: [json] });
      }
    }
  }
  return jsonArr;
}

function transformClass() { }
transformClass.prototype.transform = buildJSONArray;

module.exports = new transformClass;
