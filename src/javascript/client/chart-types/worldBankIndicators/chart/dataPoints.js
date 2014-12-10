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
    var transitionDuration = chart.transitionDuration;

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
        .attr('data-region', function(d) {return d.region;})
        .append('circle')
            .style({
                fill: function(d) {return chart.scales.regionColour(d.region); },
                stroke: function(d) {return chart.scales.regionColour(d.region).darker(); }
            });

    // Update the group locations.
    updateSelection
        .transition()
        .ease('linear')
        .duration(transitionDuration)
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
        .ease('linear')
        .duration(transitionDuration)
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

    newDataPoints.on('mouseover', function(d) {
        var node = this;
        var dataPoint = d3.select(node);

        // Highlight the data point.
        d3.select(node).classed('highlight', true);

        // Add the tooltip.
        chart.appendTooltip(dataPoint);

        // When a data point is interacted with
        // bring it to the top of the drawing
        // stack.
        // Don't do it in IE!
        // https://groups.google.com/forum/#!searchin/d3-js/mouseout/d3-js/OqD9_puVTfg/CHAnVnRCqnAJ
        if (!isIe()) {
            nodeToTop(node);
        }

        // Highlight any related legend item.
        chart.highlightLegendByRegion(d.region);
    });

    newDataPoints.on('mouseout', function(d) {
        var dataPoint = d3.select(this);
        var tooltip = dataPoint.select('.tooltip');

        // Remove the tooltip.
        tooltip.remove();

        // Remove the data point highlighting.
        dataPoint.classed('highlight', false);

        // Remove any legend highlighting
        chart.deHighlightLegendByRegion(d.region);
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

// Given a region highlight the corresponding data point.
exports.highlightDataPointByRegion = function(regionName) {
    var dataPoint = this.d3Objects.chartArea.select('[data-region="' + regionName + '"]');
    dataPoint.classed('highlight', true);
    nodeToTop(dataPoint.node());
};

// Given a region remove any highlighting.
exports.deHighlightDataPointByRegion = function(regionName) {
    this.d3Objects.chartArea.select('[data-region="' + regionName + '"]')
        .classed('highlight', false);
};

/* Helpers */

/**
 * Remove a node from the DOM then
 * put it back. For SVG elements
 * this places the node at the top
 * of the visual stack.
 * @param  {DOM node object} node The node to bring to the top.
 * @return {undefined}
 */
function nodeToTop(node) {
    var parent = node.parentNode;
    parent.appendChild(node);
}

function isIe() {
    var ua = window.navigator.userAgent.toLowerCase();
    return ua.search(/trident|msie/) !== -1;
}