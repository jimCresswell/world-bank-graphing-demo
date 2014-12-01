/**
 * World Bank Indices chart prototype.
 */
'use strict';

var d3 = require('d3');
var _isNaN = require('lodash.isnan');
var _compact = require('lodash.compact');

var cssClass = 'chart--world-bank-indices';

// Default Z range in pixels.
var defaultZRange = [10, 15];

// Temporary variable while using text labels on graph.
var textOffset = 10;


exports.init = function() {
    var chart = this;
    var d3Objects = chart.d3Objects;
    var d3Svg = d3Objects.svg = d3.select(chart.svg);

    chart.cssClass = cssClass;
    d3Svg.classed(cssClass, true);

    // Append the elements of the chart.
    d3Objects.axes = {x:null, y:null};
    d3Objects.axes.x = d3Svg.append('g').classed('axis x-axis', true);
    d3Objects.axes.y = d3Svg.append('g').classed('axis y-axis', true);
    d3Objects.legend = d3Svg.append('g').classed('legend', true);
    d3Objects.chartArea = d3Svg.append('g').classed('chart__area', true);

    // Chart area SVG padding in pixels.
    chart.padding = {
        top: 20,
        right: 20,
        bottom: 50,
        yAxis: 50
    };
    chart.padding.left = chart.padding.yAxis + 20;
};


exports.positionElements = function () {
    var chart = this;

    // Axes and plot shifted right by the padding.
    // X-axis and plot shifted right more so that data don't hit y-axis.
    // X-axis shifted down by the (chart height - padding).

    // Move the axes locations to account for padding on the plot area.
    chart.d3Objects.axes.x
        .attr('transform', 'translate(' + chart.padding.left + ', ' + (chart.dimensions.height-chart.padding.bottom) + ')');
    chart.d3Objects.axes.y
        .attr('transform', 'translate(' + chart.padding.yAxis + ',' + chart.padding.top + ')');

    // Move the plot area to account for padding on the plot area.
    chart.d3Objects.chartArea
        .attr('transform', 'translate(' + chart.padding.left + ', ' + chart.padding.top + ')');
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
    data.years = Object.keys(rawData[regions[0]][indices[0]]);
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


exports.calculateScales = function() {
    var extremes = this.data.extremes;
    var scales = this.scales;
    var chartDimensions = this.dimensions;
    var padding = this.padding;

    ['X', 'Y', 'Z'].forEach(function(dimension) {
        scales[dimension.toLowerCase()] = d3.scale
            .linear()
            .domain([
                extremes['min'+dimension] * 0.95,
                extremes['max'+dimension]
            ]);
    });

    scales.x.range([0, chartDimensions.width - padding.left - padding.right]);
    scales.y.range([chartDimensions.height - padding.top - padding.bottom, 0]);
    scales.z.range(this.zRange || defaultZRange);
};


/**
 * Draw the graph
 * @return {undefined}
 */
exports.draw = function() {
    // DEBUG
    console.log('drawing...');

    var chart = this;

    // PROTOTYPE AXES
    // Draw axes
    chart.axesFactories = {x:null, y:null};
    var xAxisFactory = chart.axesFactories.x = d3.svg.axis();
    var yAxisFactory = chart.axesFactories.y = d3.svg.axis();

    xAxisFactory.scale(chart.scales.x);
    xAxisFactory.tickFormat(d3.format("s"));

    yAxisFactory.scale(chart.scales.y);
    yAxisFactory.tickFormat(function(d) { return d + '%'});
    yAxisFactory.orient('left');

    // Append the axes.
    chart.d3Objects.axes.x.call(xAxisFactory);
    chart.d3Objects.axes.y.call(yAxisFactory);

    // Add axes labels.
    var xLabel = chart.d3Objects.axes.x
        .append('g')
        .classed('xAxis__label', true);
    xLabel.attr({transform: 'translate(' + chart.dimensions.height/2 + ',' + 40 + ')'});
    xLabel
        .append('text')
        .text(chart.accessors.x);

    var yLabel = chart.d3Objects.axes.y
        .append('g')
        .classed('yAxis__label', true);
    yLabel.style("text-anchor", "middle");
    yLabel.attr({transform: 'translate(-40, ' + chart.dimensions.height/2 + ')'});
    yLabel
        .append('text')
        .attr({transform: 'rotate(-90)'})
        .text(chart.accessors.y);


    var chartArea = this.d3Objects.chartArea;
    var dataPoints = this.d3Objects.dataPoints = chartArea
        .selectAll('g')
        .data(this.data.derived)
        .enter().append('g')
            .attr({
                transform: function(d) {
                    return 'translate(' +
                        chart.scales.x(d.x) +
                        ',' +
                         chart.scales.y(d.y) +
                        ')';
                }
            });

        dataPoints.append('circle')
            .attr({
                r: function(d) {return chart.scales.z(d.z);}
            });

        dataPoints.append('text')
            .text(function (d) {return d3.format('0.2s')(d.x) + ', ' + d3.format(',.0f')(d.y) + '%, ' + d.region;})
            .attr({
                x: function(d) {return chart.scales.z(d.z) + textOffset;},
                y: 0
            });
};


/**
 * Update the data point attributes according to
 * the current chart scales.
 * @return {undefined}
 */
exports.rescaleDataPoints = function() {
    var chart = this;
    var dataPoints = this.d3Objects.dataPoints;

    dataPoints
        .attr({
            transform: function(d) {
                return 'translate(' +
                    chart.scales.x(d.x) +
                    ',' +
                     chart.scales.y(d.y) +
                    ')';
            }
        });

    dataPoints.selectAll('circles')
        .attr({
            r: function(d) {return chart.scales.z(d.z);}
        });

    dataPoints.selectAll('text')
        .attr({
            x: function(d) {return chart.scales.z(d.z) + textOffset;},
            y: 0
        });
};