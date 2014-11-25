/**
 * The top level client-side JavaScript file.
 */

(function() {
    'use strict';

    var dataService = require('./dataService');
    var Controls = require('./controls');
    var Chart = require('./chart');

    var dataUrlPath = '/data/world-growth-indicators-by-region_Data.json';

    var controlOptions = {id: 'indices-control'};
    var chartOptions = {id: 'chart1--svg'};

    dataService.getData(dataUrlPath)
        .then(function(data) {

            // Deliberately using 'load' event because
            // it blocks on stylesheet loading and the
            // svg dimensions are taken from the DOM.
            window.addEventListener('load', function() {
                var chart = new Chart(chartOptions, data);
                var controls = new Controls(controlOptions, data);
                controls.bindToChart(chart);
                chart.draw();
            });
        })
        .done();
})();
