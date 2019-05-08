'use strict';

const jschardet = require('jschardet');
const Iconv = require('iconv').Iconv;
const dateFormat = require('dateformat');
const csvParse = require('csv-parse/lib/sync');
const request = require('sync-request');
const aws = require('aws-sdk');

function parse(body) {
  let detectResult = jschardet.detect(body);
  console.log("charset: " + detectResult.encoding);
  let iconv = new Iconv(detectResult.encoding, 'UTF-8//TRANSLIT//IGNORE');
  let convertedString = iconv.convert(body).toString();

  return csvParse(convertedString, {
    delimiter: ',', 
    rowDelimiter: 'auto', 
    quote: '"', 
    escape: '"', 
    columns: null, 
    comment: '#',
    from: 2,
    skip_empty_line: true, 
    trim: true
  }).slice();
}

module.exports.search = function(event, context, callback) {

  console.log(JSON.stringify(event));

  var url = process.env['holiday_csv_url'];
  var bucket_name = process.env['csv_bucket_name'];
  var csv_name = "public-holiday.csv";

  var d = dateFormat(
    event.date == "" ? new Date() : new Date(event.date),
    "yyyy-mm-dd");

  var s3params = {
    Bucket: bucket_name,
    Key: csv_name
  };

  var s3 = new aws.S3();
  s3.getObject(s3params, function(err, data) {
    if (err) {
      console.log("The holiday Csv is acquired because csv could not be acquired from s3");
      var response = request('GET', url);
      s3params.Body = response.body;
      if (response.statusCode == 200) {
        console.log("Acquisition of public holiday csv succeeded");
        s3.putObject(s3params, function(err, data) {
          if (err) {
            console.log(err, err.stack);
          } else  {
            console.log("Succeeded in put to s3");
            parse(response.body).reverse().forEach(function(record) {
              if (d == dateFormat(new Date(record[0]), "yyyy-mm-dd")) {
                callback(null, { statusCode: 200, date: d, publicHoliday: record[1] });
              }
            });
            callback(null, { statusCode: 200, date: d, publicHoliday: "" });
          }
        });
      } else {
        callback(null, { statusCode: response.statusCode, date: d, publicHoliday: "" });
      }
    } else {
      console.log("Succeeded in getting from s3");
      parse(data.Body).reverse().forEach(function(record) {
        if (d == dateFormat(new Date(record[0]), "yyyy-mm-dd")) {
          callback(null, { statusCode: 200, date: d, publicHoliday: record[1] });
        }
      });
      callback(null, { statusCode: 200, date: d, publicHoliday: "" });
    }
  });
};
