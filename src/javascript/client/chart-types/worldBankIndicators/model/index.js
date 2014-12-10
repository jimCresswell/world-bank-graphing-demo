/**
 * Chart type sepecific model logic.
 *
 * To be mixed in to the generic model prototype.
 */
'use strict';

var _isNaN = require('lodash.isnan');

var WorldBankIndicatorModelPrototype = module.exports = {};

WorldBankIndicatorModelPrototype.addRawData = function(rawData) {
    var data = this.data = {};

    // rawData[region][indicator] == [{year:, value:},{year:, value:},...]
    data.rawData = rawData;

    // Get the geographical regions.
    var regions = data.regions = Object.keys(rawData);

    // Each region has the same development indicators
    // so no need to loop over regions.
    var indicators = Object.keys(rawData[regions[0]]);

    // Extract information about each indicator;
    data.indicators = {};
    indicators.forEach(function (indicatorName) {
        var descriptor, unit, symbol, matches = [];

        // Some percentages are have a unit
        // of 'per 100 <something>'.
        var altPercentageString = 'per 100';

        // descriptor [(unit)]
        // e.g. GDP growth (annual %)
        // e.g. Population, total
        matches = indicatorName.match(/([^\(]+)\(?([^\)]*)/);
        descriptor = matches[1];
        unit = matches[2] || false;

        // Unit can be undefined for an indicator.
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

        data.indicators[indicatorName] = {
            descriptor: descriptor,
            unit: unit,
            symbol: symbol
        };
    });

    // Each indicator has the same years
    // so no need to loop.
    var years = data.years = Object.keys(rawData[regions[0]][indicators[0]]);

    // If any of the values are missing then try to
    // propagate previous values.
    // https://github.com/jimCresswell/world-bank-graphing-demo/issues/32
    regions.forEach(function (region) {
        indicators.forEach(function (indicator) {
            years.forEach(function (year) {
                var value = parseFloat(rawData[region][indicator][year]);
                var lastYear = year-1; // Implicit string to number coercion.
                var previousValue;
                if (_isNaN(value)) {
                    previousValue = parseFloat(rawData[region][indicator][lastYear]);
                    if (previousValue !== undefined && !_isNaN(previousValue)) {
                        rawData[region][indicator][year] = rawData[region][indicator][lastYear];
                    }
                }
            });
        });
    });
};
