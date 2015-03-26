/// <reference path="../typings/tsd.d.ts" />
var assert = require('assert');
var CBIWrapper;
(function (CBIWrapper) {
    var RECORD_LENGTH = 120;
    var RECORD_TYPES = ['PC', 'EF'];
    var CBIField = (function () {
        function CBIField() {
        }
        return CBIField;
    })();
    CBIWrapper.CBIField = CBIField;
    var CBIRecord = (function () {
        function CBIRecord(recordType) {
            assert();
        }
        return CBIRecord;
    })();
    CBIWrapper.CBIRecord = CBIRecord;
})(CBIWrapper || (CBIWrapper = {}));
module.exports = CBIWrapper;
