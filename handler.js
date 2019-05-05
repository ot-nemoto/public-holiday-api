'use strict';

const jschardet = require('jschardet');
const Iconv = require('iconv').Iconv;
const dateFormat = require('dateformat');
const csvParse = require('csv-parse/lib/sync');
const request = require('sync-request');

module.exports.search = function(event, context, callback) {

  console.log(JSON.stringify(event));

  var url = process.env['holiday_csv_url'];

  var d = dateFormat(
    event.date == "" ? new Date() : new Date(event.date),
    "yyyy-mm-dd");

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
    if (d == dateFormat(new Date(record[0]), "yyyy-mm-dd")) {
      callback(null, {
        statusCode: response.statusCode,
        date: d,
        publicHoliday: record[1]
      });
    }
  });

  callback(null, {
    statusCode: response.statusCode,
    date: d,
    publicHoliday: null
  });
};
