'use strict';
/* jshint node:true */

var src = './src';
var dest = './build';

module.exports = {
    html: {
        src: src + '/html/**',
        dest: dest + '/'
    },
    javascript: {
        clientEntryPoint: src + '/javascript/client/index.js',
        clientBundleFilename: 'bundle.js',

        dest: dest + '/javascript/'
    },
    css: {
        src: src + '/css/**',
        dest: dest + '/css/' 
    }
};