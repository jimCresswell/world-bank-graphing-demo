/**
 * Data service.
 */
'use strict';

var get = require('superagent').get;
var defer = require('q').defer;

module.exports = {
    getData: getData
};


function getData(dataUrlPath) {
    var deferred = defer();

    get(dataUrlPath, function(res) {
        if (res.error) {
            deferred.reject(res.error);
        } else {
            deferred.resolve(res.body);
        }
    });

    return deferred.promise;
}