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


/**
 * Linting.
 */


/**
 * Series of JS Hint stream modifiers.
 * @param  {string} sourceString defining the files to lint.
 * @return {stream}
 */
function jsHintPipe(sourceString) {
    return gulp.src(sourceString)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(stylish));
}

gulp.task('javascript-lint-client', function() {
    return jsHintPipe(config.srcClient);
});

gulp.task('javascript-lint-service', function() {
    return jsHintPipe(config.srcService);
});


/**
 * Testing.
 */

// TODO: test code that relies on a DOM.

// Test code that does not rely on a DOM.
gulp.task('javascript-test-service', ['javascript-lint-service'], function() {
    return gulp.src('')
        .pipe(shell('jasmine-node --noStack ' + config.specService, {ignoreErrors: true}))
        .on('error', gutil.log);
});


/**
 * Main tasks.
 */

// Get a text stream from browserify,
// pipe to vinyl-source-stream with an output
// filename argument to create a vinyl stream,
// run any intermediate tasks then write to file.
gulp.task('javascript-client', ['javascript-lint-client'], function() {
    var bundleTextStream = browserify(config.clientEntryPoint)
        .bundle();

    return bundleTextStream
        .pipe(source(config.clientBundleFilename))
        .pipe(gulp.dest(config.dest));
});

gulp.task('javascript-service', ['javascript-lint-service', 'javascript-test-service']);
