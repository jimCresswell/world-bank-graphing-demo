/**
 * World Bank Indices chart prototype.
 */
'use strict';

var d3 = require('d3');
var _assign = require('lodash.assign');

var typeConfig = require('./config');
var viewModel = require('./viewModel');
var scales = require('./scales');
var legend = require('./legend');
var axes = require('./axes');
var dataPoints = require('./dataPoints');
var tooltip = require('./tooltip');


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
    // TODO: make these instantiable so that
    // 1) They can use dependency injection.
    // 2) Functionality from a module is explicitly namespaced.
    _assign(chart, viewModel);
    _assign(chart, scales);
    _assign(chart, legend);
    _assign(chart, axes);
    _assign(chart, dataPoints);
    _assign(chart, tooltip);
};


/**
 * Update Accessors and redraw graph.
 * Used externally to control graph.
 * @param {object} newAccessors A set of accessors.
 */
exports.updateAccessors = function(newAccessors) {
    var chart = this;
    chart.setAccessors(newAccessors);
    chart.deriveCurrentData();
    chart.findDataExtremes();

    // Redraw the chart.
    chart.drawChart();
};


/**
 * Update the year in the accessors and redraw the data points.
 * Used externally to control graph.
 * @param {string} yaer A year string.
 */
exports.updateYear = function(newYear) {
    var chart = this;
    chart.accessors.year = newYear;
    chart.deriveCurrentData();

    // Rebind the chart data and redraw the data points.
    chart.updateDataPoints();
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


/**
 * Draw the graph
 * @return {undefined}
 */
exports.drawChart = function() {
    this.drawAxes();
    this.labelAxes();
    this.positionAxesLabels();
    this.updateDataPoints();
};


exports.isAtleastNarrow = function() {
    return parseInt(this.breakpointWidth) >= this.config.breakPoints.narrow;
};


exports.isAtleastMedium = function() {
    return parseInt(this.breakpointWidth) >= this.config.breakPoints.medium;
};


exports.isAtleastWide = function() {
    return parseInt(this.breakpointWidth) >= this.config.breakPoints.wide;
};
