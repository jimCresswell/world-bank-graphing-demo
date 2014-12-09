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


// Imports
// TODO: use dependency injection for these, see
// https://github.com/jimCresswell/world-bank-graphing-demo/issues/28
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
    var numTicks = chart.isAtleastMedium() ? 9 : 3;
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

    ['x', 'y'].forEach(function (axisName) {
        var d3Axis = chart.d3Objects.axes[axisName];
        var d3LabelEl = d3Axis.select('.label');
        var accessor = chart.accessors[axisName];
        var d3TextEl;
        var d3TitleEl;

        // If the accessor name is very long label
        // the axis with the accessor descriptor,
        // the label title attribute will still
        // contain the full accessor name.
        var labelString = accessor.length > 40 ? data.indices[accessor].descriptor : accessor;

        if (d3LabelEl.size() === 0) {
            d3LabelEl = d3Axis
                .append('g')
                .classed('label ' + axisName + '-axis__label', true);

            d3TextEl = d3LabelEl.append('text');
            d3TitleEl = d3LabelEl.append('title');
        } else {
            d3TextEl = d3LabelEl.select('text');
            d3TitleEl = d3LabelEl.select('title');
        }

        d3TextEl.text(labelString);
        d3TitleEl.text(accessor);
    });

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
