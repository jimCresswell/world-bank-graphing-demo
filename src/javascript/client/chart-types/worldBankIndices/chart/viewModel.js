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


exports.deriveCurrentData = function() {
    var chart = this;
    var data = this.data;
    var year= '2000'; // TODO map over years.
    var extremes = {
        minX: undefined,
        maxX: undefined,
        minY: undefined,
        maxY: undefined,
        minZ: undefined,
        maxZ: undefined
    };

    var derivedData = data.regions.map(function(region) {
        var values = {
            region: region,
            x: parseFloat(data.rawData[region][chart.accessors.x][year]),
            y: parseFloat(data.rawData[region][chart.accessors.y][year]),
            z: parseFloat(data.rawData[region][chart.accessors.z][year])
        };

        // If any of the values are missing then skip
        // this region and year combination.
        if (_isNaN(values.x) || _isNaN(values.y) || _isNaN(values.z)) {
            return false;
        }


        // Find the extremes over all data.
        ['min', 'max'].forEach(function(extreme) {
            ['X', 'Y', 'Z'].forEach(function(dimension) {
                var currentValue = values[dimension.toLowerCase()];
                if (extremes[extreme+dimension] === undefined) {
                    extremes[extreme+dimension] = currentValue;
                } else {
                    extremes[extreme+dimension] = Math[extreme](extremes[extreme+dimension], currentValue);
                }
            });
        });

        return values;
    });

    // Record the derived data with falsey values removed.
    data.derived = _compact(derivedData);

    // Record the extreme data values.
    data.extremes = extremes;
};
