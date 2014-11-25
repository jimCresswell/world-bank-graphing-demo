/**
 * The top level client-side JavaScript file.
 */

(function() {
    'use strict';

    var dataService = require('./dataService');
    var Chart = require('./Chart');

    var dataUrlPath = '/data/world-growth-indicators-by-region_Data.json';

    var chartOptions = {
        id: 'chart1--svg',
        data: false
    };

    dataService.getData(dataUrlPath)
        .then(function(data) {

            chartOptions.data = data;

            // Deliberately using 'load' event because
            // it blocks on stylesheet loading and the
            // svg dimensions are taken from the DOM.
            window.addEventListener('load', function() {
                new Chart(chartOptions);
            });
        })
        .done();
})();
