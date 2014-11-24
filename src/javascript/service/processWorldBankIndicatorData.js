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
                        .replace(/,NA/g, ',,');

    // Parse the CSV data into an object using csv-parse.
    csvParse(csvDataString,
        {
            columns: true,
            skip_empty_lines: true
        },
        function(err, output) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, reformat(output));
    });
}

/**
 * Reformat the data object from the format
 * returned by CSV-Parse to the desired
 * format.
 *
 * @param  {object} dataObject
 * @return {object} dataObject
 */
function reformat(dataObject) {

    // TODO: reformat the object.

    // DEBUG
    // TODO: strip out the empty lines at the end of the input data.
    //
    console.log(dataObject);

    return dataObject;
}