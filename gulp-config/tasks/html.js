'use strict';

var gulp = require('gulp');

var config = require('../config').html;

gulp.task('html', ['clean'], function() {
    return gulp.src(config.src)
        .pipe(gulp.dest(config.dest));
});