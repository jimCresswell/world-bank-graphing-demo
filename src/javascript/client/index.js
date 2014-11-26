/**
 * The top level client-side JavaScript file.
 */
'use strict';

var throttle = require('lodash.throttle');

var Controls = require('./controls');
var Chart = require('./chart');
var dataService = require('./dataService');

var dataUrlPath = '/data/world-growth-indicators-by-region_Data.json';
var controlOptions = {id: 'indices-control'};
var chartOptions = {id: 'chart1--svg'};

/**
 * Kick everything off!
 */
dataService.getData(dataUrlPath)
    .then(function(data) {

        // Deliberately using 'load' event because
        // it blocks on stylesheet loading and the
        // svg dimensions are taken from the DOM.
        window.addEventListener('load', function onPageLoad() {
            init(data);
        });
    })
    .done();


/**
 * Helpers.
 */

function init(data) {
    var chart;
    var controls;

    chartOptions.svg = document.getElementById(chartOptions.id);
    controlOptions.form = document.getElementById(controlOptions.id);

    chart = new Chart(chartOptions, data);
    controls = new Controls(controlOptions, data);

    controls.bindToChart(chart);

    addResizeListener();

    // Bind the data and draw the chart.
    chart.update();

    // Call onResize at most once every throttleLimit milliseconds.
    function addResizeListener() {
        var throttleLimit = 100; // Milliseconds.
        window.addEventListener('resize', throttle(chart.onResize.bind(chart), throttleLimit, {trailing: true}));
    }
}