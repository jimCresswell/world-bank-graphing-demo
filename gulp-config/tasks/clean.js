'use strict';

var gulp = require('gulp');
var del = require('del');

var pathsToDelete = ['build'];

gulp.task('clean', function(cb) {
    del(pathsToDelete, cb);
});