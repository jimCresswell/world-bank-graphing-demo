/**
 * The data from the World Bank for world growth indicators
 * can be downloaded here
 * http://data.worldbank.org/topic/financial-sector#tp_wdi .
 *
 * It can be downloaded in Excel, XML and CSV formats,
 * this module is for transforming the CSV format data
 * into a nested JavaScript object and array format.
 */
/* jshint camelcase:false */

'use strict';

module.exports = processData;

var csvParse = require('csv-parse');


/**
 * Transform a string of World Bank indicator
 * CSV data into a data structure suitable
 * for use with D3.
 *
 * @param  {string}  csvDataString  String representing CSV data.
 * @param {function} cb A callback taking an err object and optional data object suitable for use as D3 data.
 * @return {undefined}
 */
function processData(csvDataString, cb) {

    // Remove non-data lines from the input string.
    csvDataString = csvDataString
                        .replace(/,,.+/gm, '')
                        .replace(/Data from.+/i, '')
                        .replace(/Last Updated.+/i, '');

    // Standardise the representation of empty fields.
    csvDataString = csvDataString
                        .replace(/,NA/g, ',');

    // Remove year codes.
    csvDataString = csvDataString
                        .replace(/\s\[YR\d\d\d\d\]/gm, '');

    // Parse the CSV data into an object
    // using csv-parse and pass it to
    // the callback via the
    // reformat function.
    csvParse(csvDataString, {
            columns: true,
            skip_empty_lines: true
        },
        function(err, output) {
            if (err) {
                cb(err);
                return;
            }
            cb(null, reformat(output));
        }
    );
}


/**
 * Reformat the data object from the format
 * returned by CSV-Parse to the desired
 * format.
 *
 * @param  {object} dataObject
 * @return {object} output
 */
function reformat(dataObject) {
    var output = {};

    // For each set of input key value pairs
    // add the values to the appropriate
    // object in the output data.
    dataObject.forEach(function(inputSet) {
        var countryName = inputSet['Country Name'];
        var indicatorName = inputSet['Series Name'];

        // Countries can appear many times in the input
        // but should map to just one key in the output.
        var country = (output[countryName] = output[countryName] || {});

        // Combinations of country and indicator are
        // unique so this is always a new array.
        var indicator = country[indicatorName] = [];

        // If the key is a year then add
        // the data to the indicators
        // array of values.
        (Object.keys(inputSet)).forEach(function(key) {
            if(key.search(/^\d\d\d\d$/) === 0) {
                indicator.push({
                    year: key,
                    value: inputSet[key]
                });
            }
        });
    });

    return output;
}