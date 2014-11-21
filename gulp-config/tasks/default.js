'use strict';

var gulp = require('gulp');

gulp.task('default', ['build'], function(cb) {
    gulp.start('serve');
    gulp.start('watch');
    cb();
});