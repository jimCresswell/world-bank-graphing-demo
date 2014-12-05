/**
 * Chart type sepecific model logic.
 *
 * To be mixed in to the generic model prototype.
 */
'use strict';

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
