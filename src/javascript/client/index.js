/**
 * The top level client-side JavaScript file.
 */
'use strict';

var throttle = require('lodash.throttle');

var Controls = require('./controls');
var Chart = require('./chart');
var dataService = require('./dataService');

var dataUrlPath = window.location.pathname + 'data/world-growth-indicators-by-region_Data.json';
var controlOptions = {id: 'indices-controls'};
var chartOptions = {
    id: 'chart1-svg',
    chartType: 'worldBankIndices',
    defaultAccessors: {
        x: 'Population, total',
        y: 'Literacy rate, adult total (% of people ages 15 and above)',
        z: 'Internet users (per 100 people)'
    },
    zRange: [10, 20]
};


/**
 * Kick everything off!
 */

// Deliberately using 'load' event because
// it blocks on stylesheet loading and the
// svg dimensions are taken from the DOM.
window.addEventListener('load', function onPageLoad() {
    dataService.getData(dataUrlPath)
        .then(function(data) {
                init(data);
        })
        .done();
});


/**
 * Helpers.
 */

function init(data) {
    var chart;
    var controls;

    chartOptions.svg = document.getElementById(chartOptions.id);
    controlOptions.form = document.getElementById(controlOptions.id);

    // TODO instantiate a DOM event delegate for the chart.

    chart = new Chart(chartOptions, data);
    controls = new Controls(controlOptions, data);

    controls.bindToChart(chart);

    addResizeListener();

    // Draw the chart.
    chart.draw();

    // Call onResize at most once every throttleLimit milliseconds.
    function addResizeListener() {
        var throttleLimit = 100;
        var chartResize = chart.onResize.bind(chart);
        window.addEventListener('resize', throttle(chartResize, throttleLimit, {trailing: true}));
    }
}
