// attribute list
exports.nameArr = [
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
exports.selectionArr = [
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
