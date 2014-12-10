/**
 * Tooltip functionality.
 *
 * To be mixed into the parent chart prototype.
 */
'use strict';

var d3 = require('d3');
var formatValuesFactory = require('./helpers').formatValuesFactory;

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

    // Append the indicators descriptors and values content
    // with a vertical offset.
    ['x','y','z'].forEach(function(dimension, i) {
        var accessor = chart.accessors[dimension];
        var indicatorObject = chart.data.indicators[accessor];
        var descriptor = indicatorObject.descriptor;
        var labelString = accessor.length > 40 ? descriptor : accessor;
        var formatter = formatValuesFactory(indicatorObject.symbol);
        tooltip.append('text')
            .text(function(d) {return labelString + ': ' + formatter(d[dimension]);})
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