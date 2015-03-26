/// <reference path="../typings/tsd.d.ts" />
var assert = require('assert');
var CBIRecord = (function () {
    function CBIRecord(recordType) {
        assert.ok(CBIRecord.RECORD_TYPES.indexOf(recordType) > -1);
    }
    Object.defineProperty(CBIRecord, "RECORD_TYPES", {
        get: function () {
            return ['PC', 'EF'];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CBIRecord, "RECORD_LENGTH", {
        get: function () {
            return 120;
        },
        enumerable: true,
        configurable: true
    });
    return CBIRecord;
})();
exports.CBIRecord = CBIRecord;
;
