'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');

var config = require('../config').serve;

gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: config.webRoot
        },
        browser: config.browsers
    });
});

gulp.task('serve-reload', function(cb) {
    browserSync.reload();
    cb();
});
