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
    chartType: 'worldBankIndicators'
};


// Specify the default accessors and reference in control options
// and chart options rather then set in controls and pass to chart
// because chart should be instantiable and controllable without
// instantiaying UI controls.
var defaultAccessors = {
    x: 'Population, total',
    y: 'Life expectancy at birth, total (years)',
    z: 'GDP per capita (current US$)',
    year: '2010'
};
// 'CO2 emissions (metric tons per capita)',
// 'Life expectancy at birth, total (years)',
// 'Unemployment, total (% of total labor force) (modeled ILO estimate)',
// 'Inflation, GDP deflator (annual %)',

var controlOptions = {
    chartType: 'worldBankIndicators',
    id: 'chart-controls',
    idSelectHorizontal: 'chart1-select-horizontal',
    idSelectVertical: 'chart1-select-vertical',
    idSelectRadius: 'chart1-select-radius',
    idRangeYear: 'chart1-range-year',
    idSelectYear: 'chart1-select-year',
    classMinYear: 'control__min-year',
    classMaxYear: 'control__max-year',
    defaultAccessors: defaultAccessors
};

var chartOptions = {
    chartType: 'worldBankIndicators',
    id: 'chart1-svg',
    defaultAccessors: defaultAccessors,
    zRange: [10, 30]
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

    controls.addHooks(chart);

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
