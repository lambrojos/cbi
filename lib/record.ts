/// <reference path="../typings/tsd.d.ts" />

import assert = require('assert');

export class CBIRecord {

    public static get RECORD_TYPES():string[] { return ['PC','EF']; }
    public static get RECORD_LENGTH():number { return 120; }
    public static get RECORDTYPE_LENGTH():number { return 2; }

    constructor (recordType : string){

        assert.ok(
            CBIRecord.RECORD_TYPES.indexOf(recordType) > -1
        );
    }

};
