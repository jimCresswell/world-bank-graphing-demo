/**
 * Chart specific model functionality.
 *
 * To be mixed into the parent chart prototype.
 *
 */
'use strict';

var _isNaN = require('lodash.isnan');
var _compact = require('lodash.compact');


/**
 * Set the data accessors for the chart.
 * @param {object} accessors {x:'', y:'', z:''}
 */
exports.setAccessors = function(accessors) {
    if (accessors) {
        this.accessors = accessors;
        return;
    }
    this.accessors = this.defaultAccessors;
};


/**
 * Given a year, derive the current data set.
 * Needs to be called when accessors or year changes.
 * @return {undefined}
 */
exports.deriveCurrentData = function() {
    var chart = this;
    var data = chart.data;
    var accessors = chart.accessors;
    var year = accessors.year;

    var derivedData = data.regions.map(function(region) {
        var values = {
            region: region,
            x: parseFloat(data.rawData[region][accessors.x][year]),
            y: parseFloat(data.rawData[region][accessors.y][year]),
            z: parseFloat(data.rawData[region][accessors.z][year])
        };

        // If any of the values are missing then skip
        // this mark this region and year combination
        // as false.
        if (_isNaN(values.x) || _isNaN(values.y) || _isNaN(values.z)) {
            return false;
        }

        return values;
    });

    // Record the derived data with falsey values removed.
    derivedData = _compact(derivedData);
    if (derivedData.length === 0) {
        console.warn('No complete data for accessors', accessors);
    }
    data.derived = derivedData;
};


/**
 * Find the extreme data for the current accessors
 * over all regions and years.
 * Needs to be called when index accessors change
 * but not when year accessor changes.
 * @return {undfined}
 */
exports.findDataExtremes = function() {
    var chart = this;
    var data = chart.data;
    var rawData = data.rawData;
    var accessors = chart.accessors;

    var extremes = {
        minX: undefined,
        maxX: undefined,
        minY: undefined,
        maxY: undefined,
        minZ: undefined,
        maxZ: undefined
    };

    data.regions.forEach(function (region) {
        data.years.forEach(function (year) {
            ['X', 'Y', 'Z'].forEach(function(dimension) {
                var currentValue = rawData[region][accessors[dimension.toLowerCase()]][year];

                // If any of the x, y or z value are undefined for
                // this region and year then skip this value.
                if (_isNaN(currentValue)) {
                    return false;
                }

                ['min', 'max'].forEach(function(extreme) {
                    if (extremes[extreme+dimension] === undefined) {
                        extremes[extreme+dimension] = currentValue;
                    } else {
                        extremes[extreme+dimension] = Math[extreme](extremes[extreme+dimension], currentValue);
                    }
                });
            });
        });
    });

    // Record the extreme data.
    data.extremes = extremes;
};
