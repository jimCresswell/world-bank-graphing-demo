/**
 * Chart helper functions.
 */
'use strict';


// Imports: TODO: use dependency injection for these.
var d3 = require('d3');


/**
 * Given a unit symbol return a function
 * to suitably format the values of the
 * axis ticks.
 * @param  {[string} symbol
 * @return {function} string formatting function.
 */
exports.formatValuesFactory = function (symbol) {
    return function (d) {
        switch (symbol) {
            case '%':
                return d3.format(',f')(d) + symbol;
            case '$':
            case '£':
                return symbol + d3.format(',.2s')(d);
            default:
                return d3.format(',.2s')(d);
        }
    };
};