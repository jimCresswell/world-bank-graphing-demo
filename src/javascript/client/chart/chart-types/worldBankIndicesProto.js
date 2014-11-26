/**
 * World Bank Indices chart prototype.
 */
'use strict';

var d3 = require('d3');

var cssClass = 'chart--world-bank-indices';

exports.init = function() {
    this.cssClass = cssClass;
    this.d3svg = d3.select(this.svg);
    this.d3svg.classed(cssClass, true);
};


exports.update = function() {
    // TODO Re-slice and bind data according to accessors
    // possibly from passed in parameters here.
    this.draw();
};


exports.draw = function() {
    // DEBUG
    console.log('drawing...');

    this.d3svg
        .selectAll('cirlce')
        .data([10,20,30,40,50])
        .enter().append('circle')
            .attr({
                cx: function(d) {return d*6;},
                cy: function(d) {return d*6;},
                r: function(d) {return d;}
            });
};