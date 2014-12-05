/**
 * Axes functionality.
 *
 * To be mixed into the parent chart prototype.
 *
 * Tight coupling to chart index.js module
 *   * this.isWide()
 *   * chart.data
 *   * chart.accessors
 *   * chart.scales
 *   * chart.d3Objects
 *   * chart.dimensions
 *   * chart.padding
 */
'use strict';


// Imports: TODO: use dependency injection for these.
var d3 = require('d3');
var formatValuesFactory = require('./helpers').formatValuesFactory;


exports.drawAxes = function() {
    var chart = this;
    var indices = chart.data.indices;
    var xAxisFactory = d3.svg.axis();
    var yAxisFactory = d3.svg.axis();
    var xSymbol = indices[chart.accessors.x].symbol;
    var ySymbol = indices[chart.accessors.y].symbol;

    // Request a number of x-axis ticks
    // according to css breakpoint.
    var numTicks = this.isWide() ? 8 : 3;
    xAxisFactory.ticks(numTicks);

    xAxisFactory.scale(chart.scales.x);
    xAxisFactory.tickFormat(formatValuesFactory(xSymbol));

    yAxisFactory.scale(chart.scales.y);
    yAxisFactory.tickFormat(formatValuesFactory(ySymbol));
    yAxisFactory.orient('left');

    // Append the axes.
    chart.d3Objects.axes.x.call(xAxisFactory);
    chart.d3Objects.axes.y.call(yAxisFactory);
};


exports.labelAxes = function() {
    var chart = this;
    var data = chart.data;

    var xLabel = chart.d3Objects.axes.x
        .append('g')
        .classed('label xAxis__label', true);

    var xAccessor = chart.accessors.x;
    xLabel
        .append('text')
        .text(data.indices[xAccessor].descriptor);
    xLabel
        .append('title')
        .text(xAccessor);

    var yLabel = chart.d3Objects.axes.y
        .append('g')
        .classed('label yAxis__label', true);

    var yAccessor = chart.accessors.y;
    yLabel
        .append('text')
        .text(data.indices[yAccessor].descriptor);
    yLabel
        .append('title')
        .text(yAccessor);
};


exports.positionAxesLabels = function() {
    var chart = this;

    // Calculated values are dynamic centering of labels, hardcoded values are spacing away from axes.
    chart.d3Objects.axes.x.select('.label')
        .attr({transform: 'translate(' + (chart.dimensions.width-chart.padding.left-chart.padding.right)/2 + ', 45)'})
        .style({'text-anchor': 'middle'});

    // The rotation means the first coordinate in the translate is effectively y, second x.
    chart.d3Objects.axes.y.select('.label')
        .attr({transform: 'rotate(-90) translate(' + -(chart.dimensions.height-chart.padding.top-chart.padding.bottom)/2 + ', -50)'})
        .style({'text-anchor': 'middle'});
};
