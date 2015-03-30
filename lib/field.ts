/// <reference path="../typings/tsd.d.ts" />

import assert = require('assert');
import mappings = require('./record_mapping');
import s = require('underscore.string');

export class CBIField {


    constructor(
        private from : number,
        private to : number,
        private name : string,
        private content? : string) {

            assert.ok(this.validatePosition(from));
            assert.ok(this.validatePosition(to));

            if(this.length <= 0){

                throw new Error('Invalid from/to params');
            }

            this.content = content ? content : s.repeat(' ', this.length);
    }


    private validatePosition(val : number):Boolean{

        return (typeof val === 'number') && (val % 1 === 0) && ( val>0 );
    }


    //TODO validate name with enum ?
    get length(): number {

        return this.to - this.from + 1;
    }

    public toString():string { return this.content; }
}
