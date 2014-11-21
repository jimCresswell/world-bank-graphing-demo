'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');

var config = require('../config');

gulp.task('watch', function(cb) {

    // Client code tasks.
    watch(config.javascript.srcClient, function (files, cb) {
        gulp.start('javascript-client');
        cb();
    });
    watch(config.html.src, function (files, cb) {
        gulp.start('html');
        cb();
    });
    watch(config.css.src, function (files, cb) {
        gulp.start('css');
        cb();
    });

    // Non-client JS tasks.
    // TODO: run tests on change.
    //gulp.watch(config.javascript.srcService, ['javascript-service']);

    // Compiled code tasks
    watch(config.destWatch, function (files, cb) {
        gulp.start('serve-reload');
        cb();
    });

    cb();
});