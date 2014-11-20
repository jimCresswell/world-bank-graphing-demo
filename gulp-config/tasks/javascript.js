/**
 * Bundle the JS.
 *
 * Uses browerify.
 */

'use strict';
/* jshint node:true */

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var config = require('../config').javascript;


gulp.task('javascript', function() {
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