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

// Tooltip config.
var tooltipXoffset = 25;

// Colours per region.
// 9 Colours, divergent, colour-blind safe.
// From http://colorbrewer2.org/
var coloursRange = ['rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,144)','rgb(255,255,191)','rgb(224,243,248)','rgb(171,217,233)','rgb(116,173,209)','rgb(69,117,180)'];


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
        top: 25,
        right: 20,
        bottom: 50,
        yAxis: 60
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


// TODO: move to model or viewmodel.
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

    // Linear scales the three data accessors
    // where the Z accessor is mapped to the
    // radius of the datapoint.
    ['X', 'Y', 'Z'].forEach(function(dimension) {
        scales[dimension.toLowerCase()] = d3.scale
            .linear()
            .domain([
                extremes['min'+dimension] * 0.95,
                extremes['max'+dimension]
            ]);
    });

    // Ordinal scale mapping region name to a colour
    // from a range generated with
    // http://colorbrewer2.org/
    scales.regionColour = d3.scale.ordinal()
        .domain(this.data.regions)
        .range(coloursRange.map(function(colour) {return d3.rgb(colour);}));

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

    chart.drawAxes();
    chart.labelAxes();
    chart.positionAxesLabels();

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
                r: function(d) { return chart.scales.z(d.z); }
            })
            .style({
                fill: function(d) {return chart.scales.regionColour(d.region); },
                stroke: function(d) {return chart.scales.regionColour(d.region).darker(); }
            });

        // Tooltips
        dataPoints.on('mouseover', function() {
            var tooltip = d3.select(this).append('g');
            tooltip
                .classed('tooltip', true)
                .attr({
                    transform: 'translate(' + tooltipXoffset + ', 0)'
                });

            tooltip.append('text')
                .text(function(d) {return d.region;});
            tooltip.append('text')
                 .text(function(d) {return chart.accessors.x.substring(0,16) + ': ' + d.x;})
                 .attr({x: 10, y: 20});
            tooltip.append('text')
                 .text(function(d) {return chart.accessors.y.substring(0,16) + ': ' + d.y;})
                 .attr({x: 10, y: 40});
            tooltip.append('text')
                 .text(function(d) {return chart.accessors.z.substring(0,16) + ': ' + d.z;})
                 .attr({x: 10, y: 60});
        });
        dataPoints.on('mouseout', function() {
            var tooltip = d3.select(this).select('.tooltip');
            tooltip.remove();
        });
};


exports.drawAxes = function() {
    var chart = this;
    var xAxisFactory = d3.svg.axis();
    var yAxisFactory = d3.svg.axis();

    xAxisFactory.scale(chart.scales.x);
    xAxisFactory.tickFormat(d3.format('s'));

    yAxisFactory.scale(chart.scales.y);
    yAxisFactory.tickFormat(function(d) { return d + '%';});
    yAxisFactory.orient('left');

    // Append the axes.
    chart.d3Objects.axes.x.call(xAxisFactory);
    chart.d3Objects.axes.y.call(yAxisFactory);
};


exports.labelAxes = function() {
    var chart = this;

    var xLabel = chart.d3Objects.axes.x
        .append('g')
        .classed('label xAxis__label', true);

    xLabel
        .append('text')
        .text(chart.accessors.x);

    var yLabel = chart.d3Objects.axes.y
        .append('g')
        .classed('label yAxis__label', true);

    yLabel
        .append('text')
        .text(chart.accessors.y);
};


exports.positionAxesLabels = function() {
    var chart = this;

    // Calculated values are dynamic centering of labels, hardcoded values are spacing away from axes.
    chart.d3Objects.axes.x.select('.label')
        .attr({transform: 'translate(' + (chart.dimensions.width-chart.padding.left-chart.padding.right)/2 + ', 40)'})
        .style({'text-anchor': 'middle'});

    // The rotation means the first coordinate in the translate is effectively y, second x.
    chart.d3Objects.axes.y.select('.label')
        .attr({transform: 'rotate(-90) translate(' + -(chart.dimensions.height-chart.padding.top-chart.padding.bottom)/2 + ', -50)'})
        .style({'text-anchor': 'middle'});
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
};
