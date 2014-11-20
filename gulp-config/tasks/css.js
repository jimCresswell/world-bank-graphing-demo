'use strict';

var gulp = require('gulp');
var del = require('del');

var config = require('../config').css;

gulp.task('css', function() {

    // Remove existing built css.
    del.sync(config.dest);

    return gulp.src(config.src)
        .pipe(gulp.dest(config.dest));
});
