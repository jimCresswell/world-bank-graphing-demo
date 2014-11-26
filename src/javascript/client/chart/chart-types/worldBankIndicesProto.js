/**
 * World Bank Indices chart prototype.
 */
'use strict';

var d3 = require('d3');

var cssClass = 'chart--world-bank-indices';

exports.init = function() {
    var d3Objects = this.d3Objects;
    var d3Svg = d3Objects.svg = d3.select(this.svg);

    this.cssClass = cssClass;
    d3Svg.classed(cssClass, true);

    d3Objects.xAxis = d3Svg.append('g').classed('axis x-axis', true);
    d3Objects.yAxis = d3Svg.append('g').classed('axis y-axis', true);
    d3Objects.legend = d3Svg.append('g').classed('legend', true);
    d3Objects.chartArea = d3Svg.append('g').classed('chart__area', true);
};



exports.update = function() {
    // TODO: calculate scales.

    this.draw();
};


exports.draw = function() {
    // DEBUG
    console.log('drawing...');

    var chartArea = this.d3Objects.chartArea;
    chartArea
        .selectAll('cirlce')
        .data([10,20,30,40,50])
        .enter().append('circle')
            .attr({
                cx: function(d) {return d*6;},
                cy: function(d) {return d*6;},
                r: function(d) {return d;}
            });
};