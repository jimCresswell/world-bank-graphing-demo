/**
 * The data from the World Bank for world growth indicators
 * can be downloaded here
 * http://data.worldbank.org/topic/financial-sector#tp_wdi .
 *
 * It can be downloaded in Excel, XML and CSV formats,
 * this module is for transforming the CSV format data
 * into a nested JavaScript object and array format.
 */

module.exports = processData;


/**
 * Transform a string of World Bank indicator
 * CSV data into a data structure suitable
 * for use with D3.
 *
 * @param  {string}  csvDataString  String representing CSV data.
 * @return {object}  data           Object suitable for use as D3 data.
 */
function processData(csvDataString) {
    var data = {};

    // Failing implementation.
    return null;
}