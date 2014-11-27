/**
 * World Bank Indices chart prototype.
 */
'use strict';

var d3 = require('d3');

var cssClass = 'chart--world-bank-indices';

// Default Z range in pixels.
var defaultZRange = [10, 15];

exports.init = function() {
    var d3Objects = this.d3Objects;
    var d3Svg = d3Objects.svg = d3.select(this.svg);

    this.cssClass = cssClass;
    d3Svg.classed(cssClass, true);

    d3Objects.xAxis = d3Svg.append('g').classed('axis x-axis', true);
    d3Objects.yAxis = d3Svg.append('g').classed('axis y-axis', true);
    d3Objects.legend = d3Svg.append('g').classed('legend', true);
    d3Objects.chartArea = d3Svg.append('g').classed('chart__area', true);
};


exports.addRawData = function(rawData) {
    var data = this.data = {};

    // rawData[region][index] == [{year:, value:},{year:, value:},...]
    data.rawData = rawData;

    // Get the geographical regions.
    var regions = data.regions = Object.keys(rawData);

    // Each region has the same development indices.
    var indices = data.indices = Object.keys(rawData[regions[0]]);

    // Each index has the same years.
    data.years = (rawData[regions[0]][indices[0]]).map(function(indexPoint) {
        return indexPoint.year;
    });
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

    data.derived = data.regions.map(function(region) {
        var values = {
            region: region,
            x: data.rawData[region][chart.accessors.x][year],
            y: data.rawData[region][chart.accessors.y][year],
            z: data.rawData[region][chart.accessors.z][year]
        };

        // Find the extremes over all data.
        ['min', 'max'].forEach(function(extreme) {
            ['X', 'Y', 'Z'].forEach(function(dimension) {
                var extremeValue = extremes[extreme+dimension];
                var currentValue = values[dimension.toLowerCase()];
                if (extremeValue === undefined) {
                    extremeValue = currentValue;
                } else {
                    extremeValue = Math[extreme](extremeValue, currentValue);
                }
            });
        });

        return values;
    });

    this.data.extremes = extremes;
};


exports.calculateScales = function() {
    var extremes = this.data.extremes;
    var scales = this.scales;
    var chartDimensions = this.dimensions;

    ['X', 'Y', 'Z'].forEach(function(dimension) {
        scales[dimension.toLowerCase()] = d3.scale
            .linear()
            .domain([extremes['min'+dimension], extremes['max'+dimension]]);
    });

    scales.x.rangeRound([0,chartDimensions.width]);
    scales.y.rangeRound([chartDimensions.height,0]);
    scales.z.rangeRound(this.zRange || defaultZRange);
};


exports.draw = function() {
    // DEBUG
    console.log('drawing...');

    // TODO loop over the years.

    var chartArea = this.d3Objects.chartArea;
    chartArea
        .selectAll('cirlce')
        .data(this.data.derived)
        .enter().append('circle')
            .attr({
                cx: function(d) {return this.scales.x(d.x);},
                cy: function(d) {return this.scales.x(d.y);},
                r: function(d) {return this.scales.x(d.z);}
            });

debugger;

            // TODO: set the colour according to region.
};


exports.update = function() {
    this.setAccessors();
    this.deriveCurrentData();
    this.calculateScales();
    this.draw();
};
