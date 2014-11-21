/**
 * Bundle the JS.
 *
 * Uses browserify.
 */

'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var shell = require('gulp-shell');
var gutil = require('gulp-util');

var config = require('../config').javascript;

// Lint and fail the task if the linting fails.
gulp.task('lint-javascript-client', function() {
    return gulp.src(config.srcClient)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});
gulp.task('lint-javascript-service', function() {
    return gulp.src(config.srcClient)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('javascript-client', ['lint-javascript-client'], function() {
    var bundleStream = browserify(config.clientEntryPoint)
        .bundle();

    // Pass desired output filename to vinyl-source-stream,
    // run any intermediate tasks then write to file.
    return bundleStream
        .pipe(source(config.clientBundleFilename))
        .pipe(gulp.dest(config.dest));
});

gulp.task('javascript-service', ['lint-javascript-service'], function() {
    return gulp.src('')
        .pipe(shell('jasmine-node --noStack  ./spec/', {ignoreErrors: true}))
        .on('error', gutil.log);
});
