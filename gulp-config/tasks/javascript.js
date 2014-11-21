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

// Linting
gulp.task('javascript-lint-client', function() {
    return gulp.src(config.srcClient)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
});
gulp.task('javascript-lint-service', function() {
    return gulp.src(config.srcService)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
});

// Testing
gulp.task('javascript-test-service', ['javascript-lint-service'], function() {
    return gulp.src('')
        .pipe(shell('jasmine-node --noStack  ./spec/service', {ignoreErrors: true}))
        .on('error', gutil.log);
});

// Get a text stream from browserify,
// pipe to vinyl-source-stream with an output
// filename argument to create a buffer stream,
// run any intermediate tasks then write to file.
gulp.task('javascript-client', ['javascript-lint-client'], function() {
    var bundleTextStream = browserify(config.clientEntryPoint)
        .bundle();
    return bundleTextStream
        .pipe(source(config.clientBundleFilename))
        .pipe(gulp.dest(config.dest));
});

gulp.task('javascript-service', ['javascript-lint-service', 'javascript-test-service']);
