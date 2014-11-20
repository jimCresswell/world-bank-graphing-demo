/**
 *   To add a new task add a file with that task
 *   name to the gulp-config/tasks directory
 *   e.g. `gulp-config/tasks/default.js` . 
 */

'use strict';
/* jshint node:true */

var requireDir = require('require-dir');

requireDir('./gulp-config/tasks', { recurse: true });