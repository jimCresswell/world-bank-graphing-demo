/**
 * Data points functionality.
 *
 * To be mixed into the parent chart prototype.
 *
 */
'use strict';

var d3 = require('d3');

exports.updateDataPoints = function() {
    var chart = this;
    var chartArea = chart.d3Objects.chartArea;

    // Update selection.
    var updateSelection = chartArea
        .selectAll('g')
        .data(chart.data.derived, function(d) { return d.region; });


    // Exit selection.
    updateSelection.exit()
        .remove();


    // Enter selection.
    // Append groups and circles (enter selection entities move to update selection).
    updateSelection.enter()
        .append('g')
        .append('circle')
            .style({
                fill: function(d) {return chart.scales.regionColour(d.region); },
                stroke: function(d) {return chart.scales.regionColour(d.region).darker(); }
            });

    // Update the group locations.
    updateSelection
        .transition()
        .attr({
            transform: function(d) {
                return 'translate(' +
                    chart.scales.x(d.x) +
                    ',' +
                     chart.scales.y(d.y) +
                    ')';
            }
        });

    // Update the circle radii.
    // Note 'select' propagates bound data to
    // child elements, selectAll does not.
    updateSelection.select('circle')
        .transition()
        .attr({
            r: function(d) {
                return chart.scales.z(d.z);
            }
        });

    // Add interaction behaviour
    chart.enableDataPointInteractions(updateSelection);
};


exports.enableDataPointInteractions = function(newDataPoints) {
    var chart = this;

    newDataPoints.on('mouseover', function() {
        var node = this;
        chart.appendTooltip(node);

        // When a data point is interacted with
        // bring it to the top of the drawing
        // stack.
        var parent = this.parentNode;
        parent.removeChild(this);
        parent.appendChild(this);
    });

    newDataPoints.on('mouseout', function() {
        var tooltip = d3.select(this).select('.tooltip');
        tooltip.remove();
    });
};


/**
 * Update the data point attributes according to
 * the current chart scales.
 * @return {undefined}
 */
exports.rescaleDataPoints = function() {
    var chart = this;
    var dataPoints = this.d3Objects.chartArea.selectAll('g');

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
