/**
 * Static default configuration for the World Bank indices chart.
 */

'use strict';

module.exports = {
    cssClass: 'chart--world-bank-indices',

    // Colours per region.
    // 9 Colours, contrasting.
    // From http://colorbrewer2.org/
    coloursRange: ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)'],

    // Legend configuration.
    // The padding between side by side item groups in the legend in px.
    legendItemPadding: 10,

    hasLegend: true
};