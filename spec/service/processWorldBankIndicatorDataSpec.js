describe("Process World Bank Inidicator Data", function() {
    var processData = require('../../src/javascript/service/processWorldBankIndicatorData.js');

    var testData = require('./testData.js');

    it("should process World Bank CSV data into a nested JavaScript data structure", function() {
        var actualData = processData(testData.csv);
        expect(actualData).toEqual(testData.parsed);
    });
});
