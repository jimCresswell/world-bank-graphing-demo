'use strict';

var src = './src';
var dest = './build';

module.exports = {
    html: {
        src: src + '/html/**',
        dest: dest + '/'
    },
    javascript: {
        src: src + '/javascript/**',
        dest: dest + '/javascript/',
        clientEntryPoint: src + '/javascript/client/index.js',
        clientBundleFilename: 'bundle.js',
    },
    css: {
        src: src + '/css/**',
        dest: dest + '/css/' 
    },
    webRoot: dest
};