/**
 * The top level client-side JavaScript file.
 */
'use strict';

var throttle = require('lodash.throttle');

var Model = require('./model');
var Controls = require('./controls');
var Chart = require('./chart');

var dataService = require('../service/dataService');

var dataUrlPath = window.location.pathname + 'data/world-growth-indicators-by-region_Data.json';


var modelOptions = {
    chartType: 'worldBankIndices'
};

var controlOptions = {
    chartType: 'worldBankIndices',
    id: 'chart-controls',
    idSelectHorizontal: 'chart1-select-horizontal',
    idSelectVertical: 'chart1-select-vertical',
    idSelectRadius: 'chart1-select-radius',
    idRangeYear: 'chart1-range-year',
    idSelectYear: 'chart1-select-year',
    classMinYear: 'control__min-year',
    classMaxYear: 'control__max-year'
};

var chartOptions = {
    chartType: 'worldBankIndices',
    id: 'chart1-svg',
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
    var model;
    var controls;
    var chart;

    // Store references to key UI elements.
    chartOptions.svg = document.getElementById(chartOptions.id);
    controlOptions.form = document.getElementById(controlOptions.id);

    model = new Model(modelOptions, data);
    controls = new Controls(controlOptions, model);
    chart = new Chart(chartOptions, model);

    // TODO bind changes in the controls to the chart update functionality.
    // Possibly using events?

    // Re-style the chart on resize.
    addResizeListener(chart);
}


// Call onResize for the specified UI component
// at most once every <throttleLimit> milliseconds.
function addResizeListener(component) {
    var throttleLimit = 100;
    var onResize = component.onResize.bind(component);
    window.addEventListener('resize', throttle(onResize, throttleLimit, {trailing: true}));
}
