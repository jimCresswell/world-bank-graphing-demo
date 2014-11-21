'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');

var config = require('../config');

gulp.task('watch', function() {
    // Client code tasks.
    gulp.watch(config.javascript.srcClient, ['javascript-client']);
    gulp.watch(config.html.src, ['html']);
    gulp.watch(config.css.src, ['css']);

    // Non-client JS tasks.
    //gulp.watch(config.javascript.srcService, ['javascript-service']);

    // Compiled code tasks
    // gulp.watch(config.webroot + '/**', browserSync.reload);
});