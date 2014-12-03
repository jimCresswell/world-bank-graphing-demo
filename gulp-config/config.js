'use strict';

var src = './src';
var dest = './build';
var spec = './spec';

module.exports = {
    html: {
        src: src + '/html/**',
        dest: dest + '/'
    },
    javascript: {
        srcService: src + '/javascript/service/**/*.js',
        srcClient: src + '/javascript/client/**/*.js',
        specService: spec + '/service',
        specClient: spec + '/client',
        clientEntryPoint: src + '/javascript/client/index.js',
        clientBundleFilename: 'bundle.js',
        dest: dest + '/javascript/',
    },
    css: {
        src: src + '/css/**',
        dest: dest + '/css/'
    },
    data: {
        src: src + '/data/**/*.csv',
        dest: dest + '/data/'
    },
    webRoot: dest,
    destWatch: dest + '/**/*',
    publish: {
        src: dest + '/**/*'
    }
};