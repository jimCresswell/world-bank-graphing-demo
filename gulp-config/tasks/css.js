'use strict';

var gulp = require('gulp');

var config = require('../config').css;

gulp.task('css', ['clean'], function() {
    return gulp.src(config.src)
        .pipe(gulp.dest(config.dest));
});