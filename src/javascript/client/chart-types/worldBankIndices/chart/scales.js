/**
 * Scales functionality.
 *
 * To be mixed into the parent chart prototype.
 */
'use strict';

var d3 = require('d3');


// Ordinal scales dependent only on the data.
exports.calculateOrdinalScales = function() {
    var scales = this.scales;
    var config = this.config;

    // Ordinal scale mapping region name to a colour
    // from a range generated with
    // http://colorbrewer2.org/
    scales.regionColour = d3.scale.ordinal()
        .domain(this.data.regions)
        .range(config.coloursRange.map(function(colour) {return d3.rgb(colour);}));
};


// Dimensional scales dependent on the viewport dimensions.
exports.calculateScales = function() {
    var extremes = this.data.extremes;
    var scales = this.scales;
    var chartDimensions = this.dimensions;
    var padding = this.padding;

    // Linear scales the three data accessors
    // where the Z accessor is mapped to the
    // radius of the datapoint.
    ['X', 'Y', 'Z'].forEach(function(dimension) {
        scales[dimension.toLowerCase()] = d3.scale
            .linear()
            .domain([
                extremes['min'+dimension] * 0.95,
                extremes['max'+dimension]
            ])
            .nice();
    });

    scales.x.range([0, chartDimensions.width - padding.left - padding.right]);
    scales.y.range([chartDimensions.height - padding.top - padding.bottom, 0]);
    scales.z.range(this.zRange);
};