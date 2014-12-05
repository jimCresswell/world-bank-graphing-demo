/**
 * Chart specific model functionality.
 *
 * To be mixed into the parent chart prototype.
 *
 */
'use strict';

var _isNaN = require('lodash.isnan');
var _compact = require('lodash.compact');

exports.addRawData = function(rawData) {
    var data = this.data = {};

    // rawData[region][index] == [{year:, value:},{year:, value:},...]
    data.rawData = rawData;

    // Get the geographical regions.
    var regions = data.regions = Object.keys(rawData);

    // Each region has the same development indices
    // so no need to loop over regions.
    var indexKeys = Object.keys(rawData[regions[0]]);

    // Extract information about each index;
    data.indices = {};
    indexKeys.forEach(function (indexName) {
        var descriptor, unit, symbol, matches = [];

        // Some percentages are have a unit
        // of 'per 100 <something>'.
        var altPercentageString = 'per 100';

        // descriptor [(unit)]
        // e.g. GDP growth (annual %)
        // e.g. Population, total
        matches = indexName.match(/([^\(]+)\(?([^\)]*)/);
        descriptor = matches[1];
        unit = matches[2] || false;

        // Unit can be undefined for an index.
        // Unit does not have to contain a symbol.
        if (unit) {
            matches = unit.match(new RegExp('[%$£]|'+altPercentageString));
            symbol = matches ? matches[0] : false;

            // Cope with some values being labelled
            // 'per 100' instead of %.
            if (symbol === altPercentageString) {
                symbol = '%';
            }
        }

        data.indices[indexName] = {
            descriptor: descriptor,
            unit: unit,
            symbol: symbol
        };
    });

    // Each index has the same years
    // so no need to loop.
    data.years = Object.keys(rawData[regions[0]][indexKeys[0]]);
};


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
