/* @flow */

var should = require('should');
var utilities = require('../utilities.js');

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

describe('Test if it transforms correctly', function() {
  it('should transform correctly', function() {
    var test = [
      ['LEC', 'LEC', 'DIS', 'DIS', 'LEC', 'DIS'],
      [ '1',   '2',   '2A',  '2B',  '3',   '3A'],
      [ 'MWF', 'MWF', 'TR', 'TR',  'MWF',  'TR'],
      [ '9:00A', '12:00P', '2:00P', '10:00A', '4:00P', '8:00A' ],
      [ '11:00A', '2:00P', '4:00P', '12:00P', '6:00P', '10:00A' ],
      [ 'Building1', 'Building2', 'Building3', 'Building4', 'Building5', 'Building6'],
      [ '1000', '1200', '500', '102A', '221B', '50C' ],
      [ '', 'Yes', '', '', 'Yes', ''],
      [ '20',  '30', '10', '40', '50', '60'],
      [ '100', '50', '80', '40', '80', '60'],
      [   '0',  '0',  '0', '10', '0',  '5'],
      [   '5',  '0',  '0', '10', '0',  '10'],
      [ 'Open', 'Open', 'Open', 'Closed', 'Open', 'W-List' ]
    ];

    var arr = utilities.transform(test, nameArr);
    arr.length.should.equal(3);

    arr[0].classes.length.should.equal(1);
    arr[0].classes[0].dataType.should.equal('LEC');
    arr[0].classes[0].sectionNumber.should.equal('1');
    arr[0].classes[0].days.should.equal('MWF');
    arr[0].classes[0].timeStart.should.equal('9:00A');
    arr[0].classes[0].timeEnd.should.equal('11:00A');
    arr[0].classes[0].building.should.equal('Building1');
    arr[0].classes[0].room.should.equal('1000');
    arr[0].classes[0].restrict.should.equal('');
    arr[0].classes[0].enrollTotal.should.equal(20);
    arr[0].classes[0].enrollCap.should.equal(100);
    arr[0].classes[0].waitTotal.should.equal(0);
    arr[0].classes[0].waitCap.should.equal(5);
    arr[0].classes[0].status.should.equal('Open');

    arr[1].classes.length.should.equal(3);
    arr[1].classes[0].dataType.should.equal('LEC');
    arr[1].classes[0].sectionNumber.should.equal('2');
    arr[1].classes[0].days.should.equal('MWF');
    arr[1].classes[0].timeStart.should.equal('12:00P');
    arr[1].classes[0].timeEnd.should.equal('2:00P');
    arr[1].classes[0].building.should.equal('Building2');
    arr[1].classes[0].room.should.equal('1200');
    arr[1].classes[0].restrict.should.equal('Yes');
    arr[1].classes[0].enrollTotal.should.equal(30);
    arr[1].classes[0].enrollCap.should.equal(50);
    arr[1].classes[0].waitTotal.should.equal(0);
    arr[1].classes[0].waitCap.should.equal(0);
    arr[1].classes[0].status.should.equal('Open');

    arr[1].classes[1].dataType.should.equal('DIS');
    arr[1].classes[1].sectionNumber.should.equal('2A');
    arr[1].classes[1].days.should.equal('TR');
    arr[1].classes[1].timeStart.should.equal('2:00P');
    arr[1].classes[1].timeEnd.should.equal('4:00P');
    arr[1].classes[1].building.should.equal('Building3');
    arr[1].classes[1].room.should.equal('500');
    arr[1].classes[1].restrict.should.equal('');
    arr[1].classes[1].enrollTotal.should.equal(10);
    arr[1].classes[1].enrollCap.should.equal(80);
    arr[1].classes[1].waitTotal.should.equal(0);
    arr[1].classes[1].waitCap.should.equal(0);
    arr[1].classes[1].status.should.equal('Open');

    arr[1].classes[2].dataType.should.equal('DIS');
    arr[1].classes[2].sectionNumber.should.equal('2B');
    arr[1].classes[2].days.should.equal('TR');
    arr[1].classes[2].timeStart.should.equal('10:00A');
    arr[1].classes[2].timeEnd.should.equal('12:00P');
    arr[1].classes[2].building.should.equal('Building4');
    arr[1].classes[2].room.should.equal('102A');
    arr[1].classes[2].restrict.should.equal('');
    arr[1].classes[2].enrollTotal.should.equal(40);
    arr[1].classes[2].enrollCap.should.equal(40);
    arr[1].classes[2].waitTotal.should.equal(10);
    arr[1].classes[2].waitCap.should.equal(10);
    arr[1].classes[2].status.should.equal('Closed');

    arr[2].classes.length.should.equal(2);
    arr[2].classes[0].dataType.should.equal('LEC');
    arr[2].classes[0].sectionNumber.should.equal('3');
    arr[2].classes[0].days.should.equal('MWF');
    arr[2].classes[0].timeStart.should.equal('4:00P');
    arr[2].classes[0].timeEnd.should.equal('6:00P');
    arr[2].classes[0].building.should.equal('Building5');
    arr[2].classes[0].room.should.equal('221B');
    arr[2].classes[0].restrict.should.equal('Yes');
    arr[2].classes[0].enrollTotal.should.equal(50);
    arr[2].classes[0].enrollCap.should.equal(80);
    arr[2].classes[0].waitTotal.should.equal(0);
    arr[2].classes[0].waitCap.should.equal(0);
    arr[2].classes[0].status.should.equal('Open');

    arr[2].classes[1].dataType.should.equal('DIS');
    arr[2].classes[1].sectionNumber.should.equal('3A');
    arr[2].classes[1].days.should.equal('TR');
    arr[2].classes[1].timeStart.should.equal('8:00A');
    arr[2].classes[1].timeEnd.should.equal('10:00A');
    arr[2].classes[1].building.should.equal('Building6');
    arr[2].classes[1].room.should.equal('50C');
    arr[2].classes[1].restrict.should.equal('');
    arr[2].classes[1].enrollTotal.should.equal(60);
    arr[2].classes[1].enrollCap.should.equal(60);
    arr[2].classes[1].waitTotal.should.equal(5);
    arr[2].classes[1].waitCap.should.equal(10);
    arr[2].classes[1].status.should.equal('W-List');
  });
});
