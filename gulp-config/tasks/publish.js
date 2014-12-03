var gulp = require('gulp');
var publish = require('gulp-gh-pages');

var config = require('../config').publish;

gulp.task('publish', function () {
    return gulp.src(config.src)
        .pipe(publish());
});
