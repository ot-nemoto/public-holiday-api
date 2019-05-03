'use strict';

const jschardet = require('jschardet');
const Iconv = require('iconv').Iconv;
const dateFormat = require('dateformat');
const csvParse = require('csv-parse/lib/sync');
const request = require('sync-request');

module.exports.hello = function(event, context, callback) {

  console.log(event);

  var url = 'https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv';

  var paramDate = dateFormat(new Date(event.date), "yyyymmdd");

  var response = request('GET', url);

  let detectResult = jschardet.detect(response.body);
  console.log("charset: " + detectResult.encoding);
  let iconv = new Iconv(detectResult.encoding, 'UTF-8//TRANSLIT//IGNORE');
  let convertedString = iconv.convert(response.body).toString();

  csvParse(convertedString, {
    delimiter: ',', 
    rowDelimiter: 'auto', 
    quote: '"', 
    escape: '"', 
    columns: null, 
    comment: '#',
    from: 2,
    skip_empty_line: true, 
    trim: true
  }).slice().reverse().forEach(function(record) {
    if (paramDate == dateFormat(new Date(record[0]), "yyyymmdd")) {
      callback(null, {
        statusCode: response.statusCode,
        date: paramDate,
        publicHoliday: record[1]
      });
    }
  });

  callback(null, {
    statusCode: response.statusCode,
    date: paramDate,
    publicHoliday: null
  });
};
