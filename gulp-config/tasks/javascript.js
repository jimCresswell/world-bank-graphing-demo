/**
 * Bundle the JS.
 *
 * Uses browserify.
 */

'use strict';
/* jshint node:true */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var config = require('../config').javascript;


gulp.task('lint-javascript', function() {
  return gulp.src(config.src)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('javascript', ['lint-javascript'], function() {
    var bundleStream = browserify(config.clientEntryPoint)
        .bundle();

    /**
     * Pass desired output filename to vinyl-source-stream,
     * run any intermediate tasks then write to file.
     */

    return bundleStream
        .pipe(source(config.clientBundleFilename))
        .pipe(gulp.dest(config.dest));
});