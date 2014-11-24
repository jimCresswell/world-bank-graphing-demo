'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var eventStream = require('event-stream');

var config = require('../config').data;
var processData = require('../../src/javascript/service/processWorldBankIndicatorData');

gulp.task('data', function() {
    return gulp.src(config.src)
        .pipe(transformData())
        .pipe(rename({
            extname: '.json'
        }))
        .pipe(gulp.dest(config.dest));
});

// Transform the CSV data file into a JSON
// encoded nested data object file.
// Roughly based on http://stackoverflow.com/questions/22835609/gulp-ondata-how-to-pass-data-to-next-pipe
// Docs for writing plugins https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md
function transformData() {
  function transform(fileStream, cb) {

    // Process data takes a CSV encoded string
    // and returns a nested object.
    processData(String(fileStream.contents), function(err, data) {
        if (err) {
            cb(err);
            return;
        }
        fileStream.contents = new Buffer(JSON.stringify(data));
        cb(null, fileStream);
    });
  }

  // returning the map will cause your transform function to be called
  // for each one of the chunks (files) you receive. And when this stream
  // receives a 'end' signal, it will end as well.
  return eventStream.map(transform);
}