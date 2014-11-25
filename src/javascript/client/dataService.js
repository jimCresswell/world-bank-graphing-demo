/**
 * Data service
 */
'use strict';

var request = require('superagent');
var Q = require('q');

module.exports = {
    getData: getData
};


function getData(dataUrlPath) {
    var deferred = Q.defer();

    request.get(dataUrlPath, function(res) {
        if (res.error) {
            deferred.reject(res.error);
        } else {
            deferred.resolve(res.body);
        }
    });

    return deferred.promise;
}