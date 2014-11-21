'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');

var config = require('../config');

gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: config.webRoot
        }
    });
});

gulp.task('serve-reload', function(cb) {
    browserSync.reload();
    cb();
});
