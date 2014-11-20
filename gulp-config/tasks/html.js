'use strict';

var gulp = require('gulp');
var del = require('del');

var config = require('../config').html;

gulp.task('html', function() {

    // Remove existing built html.
    del.sync(config.dest);

    return gulp.src(config.src)
        .pipe(gulp.dest(config.dest));
});
