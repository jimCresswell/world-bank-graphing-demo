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


var WorldBankIndicatorChartPrototype = module.exports = {};


WorldBankIndicatorChartPrototype.config = typeConfig;

_assign(WorldBankIndicatorChartPrototype, viewModel);
_assign(WorldBankIndicatorChartPrototype, scales);
_assign(WorldBankIndicatorChartPrototype, legend);
_assign(WorldBankIndicatorChartPrototype, axes);
_assign(WorldBankIndicatorChartPrototype, dataPoints);
_assign(WorldBankIndicatorChartPrototype, tooltip);

// Chart type specific initialisation tasks.
WorldBankIndicatorChartPrototype.init = function() {
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
};


/**
 * Update Accessors and redraw graph.
 * Used externally to control graph.
 * @param {object} newAccessors A set of accessors.
 */
WorldBankIndicatorChartPrototype.updateAccessors = function(newAccessors) {
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
WorldBankIndicatorChartPrototype.updateYear = function(newYear) {
    var chart = this;
    chart.accessors.year = newYear;
    chart.deriveCurrentData();

    // Rebind the chart data and redraw the data points.
    chart.updateDataPoints();
};


// Chart area SVG padding in pixels.
// Depends on the computed dimensions of the legend.
WorldBankIndicatorChartPrototype.setAreaChartPadding = function() {
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


WorldBankIndicatorChartPrototype.positionChartElements = function () {
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
WorldBankIndicatorChartPrototype.drawChart = function() {
    this.drawAxes();
    this.labelAxes();
    this.positionAxesLabels();
    this.updateDataPoints();
};


WorldBankIndicatorChartPrototype.isAtleastNarrow = function() {
    return parseInt(this.breakpointWidth) >= this.config.breakPoints.narrow;
};


WorldBankIndicatorChartPrototype.isAtleastMedium = function() {
    return parseInt(this.breakpointWidth) >= this.config.breakPoints.medium;
};


WorldBankIndicatorChartPrototype.isAtleastWide = function() {
    return parseInt(this.breakpointWidth) >= this.config.breakPoints.wide;
};
