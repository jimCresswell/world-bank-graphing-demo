'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');

var config = require('../config');

var pathsToWatch = [
    config.javascript.src,
    config.html.src,
    config.css.src
];

gulp.task('watch', function() {
    gulp.watch(pathsToWatch, ['build', browserSync.reload]);
});