/**
 * World Bank Indices chart prototype.
 */
'use strict';

var d3 = require('d3');
var _assign = require('lodash.assign');

var typeConfig = require('./config');
var viewModel = require('./viewModel');
var legend = require('./legend');
var axes = require('./axes');
var formatValuesFactory = require('./helpers').formatValuesFactory;


// Make the chart type specific config
// available on the chart prototype
// before calling this.init() so that the
// generic chart constructor can use it.
exports.config = typeConfig;


// Chart type specific initialisation tasks.
exports.init = function() {
    var chart = this;
    var d3Objects = chart.d3Objects;
    var d3Svg = d3Objects.svg = d3.select(chart.svg);

    d3Svg.classed(chart.config.cssClass, true);

    // Append the elements of the chart.
    d3Objects.axes = {};
    d3Objects.axes.x = d3Svg.append('g').classed('axis x-axis', true);
    d3Objects.axes.y = d3Svg.append('g').classed('axis y-axis', true);
    d3Objects.legend = d3Svg.append('g').classed('legend', true);
    d3Objects.chartArea = d3Svg.append('g').classed('chart__area', true);

    // Mix in other functionality.
    _assign(chart, viewModel);
    _assign(chart, legend);
    _assign(chart, axes);
};


// Chart area SVG padding in pixels.
// Depends on the computed dimensions of the legend.
exports.setAreaChartPadding = function() {
    var chart = this;
    var legend = chart.d3Objects.legend;

    var legendDimensions = legend.node().getBoundingClientRect();

    chart.padding = {
        top: 50 + legendDimensions.height,
        right: 20,
        bottom: 50,
        yAxis: 65
    };
    chart.padding.left = chart.padding.yAxis + 20;
};


exports.positionChartElements = function () {
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


/**
 * Draw the graph
 * @return {undefined}
 */
exports.drawChart = function() {
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

    // Add interaction behaviour
    // The D3 event API only allows
    // one event of each type to be
    // added to an element.
    chart.enableDatapointInteractions();

    // Add circles to the datapoints.
    dataPoints.append('circle')
        .attr({
            r: function(d) { return chart.scales.z(d.z); }
        })
        .style({
            fill: function(d) {return chart.scales.regionColour(d.region); },
            stroke: function(d) {return chart.scales.regionColour(d.region).darker(); }
        });
};


exports.enableDatapointInteractions = function() {
    var chart = this;
    var dataPoints = chart.d3Objects.dataPoints;

    dataPoints.on('mouseover', function() {
        var node = this;
        chart.appendTooltip(node);

        // When a datapoint is interacted with
        // bring it to the top of the drawing
        // stack.
        var parent = this.parentNode;
        parent.removeChild(this);
        parent.appendChild(this);
    });

    dataPoints.on('mouseout', function() {
        var tooltip = d3.select(this).select('.tooltip');
        tooltip.remove();
    });
};


exports.isWide = function() {
    return parseInt(this.breakpointWidth) >= this.config.breakPoints.medium;
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


/**
 * Given a node append a tooltip to it.
 *
 * Note: can't append node after setting content
 * because the content relies on the inherited
 * data from the parent node and because the
 * getBoundingClientRect method requires
 * the element to be in the DOM.
 *
 * @param  {DOMNode} node
 * @return {undefined}
 */
exports.appendTooltip = function(node) {
    var chart = this;
    var datapoint = d3.select(node);
    var tooltip = datapoint.append('g');

    tooltip
        .classed('tooltip', true);


    // Calculate the offset directions for
    // tooltips according to which chart
    // quadrant the datapoint is in.
    // The default tooltip offset (in the
    // top left quadrant) is down and to
    // the right.
    var xOffsetSign = 1;
    var yOffsetSign = 1;
    var textAnchor = 'start';
    var plotWidth = chart.dimensions.width - chart.padding.left - chart.padding.right;
    var plotHeight = chart.dimensions.height - chart.padding.top - chart.padding.bottom;
    var translate = d3.transform(datapoint.attr('transform')).translate;
    var xTranslate = translate[0];
    var yTranslate = translate[1];
    if (xTranslate >= plotWidth/2) {
        xOffsetSign = -1;
        textAnchor = 'end';
    }
    if (yTranslate >= plotHeight/2) {
        yOffsetSign = -1;
    }

    // Append the region tooltip content.
    tooltip.append('text')
        .text(function(d) {return d.region;});

    // Append the indices descriptors and values content
    // with a vertical offset.
    ['x','y','z'].forEach(function(dimension, i) {
        var indexObject = chart.data.indices[chart.accessors[dimension]];
        var descriptor = indexObject.descriptor;
        var formatter = formatValuesFactory(indexObject.symbol);
        tooltip.append('text')
            .text(function(d) {return descriptor + ': ' + formatter(d[dimension]);})
            .attr({
               y: 20*(i+1)
            });
    });

    // Position the tooltip according to
    // its offset directions.
    tooltip
        .attr('transform', function(d) {
            var circleRadius = chart.scales.z(d.z);

            // Default, move the tooltip down a bit.
            var yOffset = yOffsetSign * circleRadius * 0.5;

            // Move the tooltip up.
            if (yOffsetSign === -1) {
                yOffset = yOffsetSign * (tooltip.node().getBoundingClientRect().height - circleRadius);
            }

            // Horizontal displacement, acts together with
            // text-anchor: start/end.
            // Offset by circle radius plus a constant.
            var xOffset = xOffsetSign * (circleRadius + 4);

            return 'translate(' + xOffset + ',' + yOffset + ')';
        })
        .style({'text-anchor': textAnchor});
};
