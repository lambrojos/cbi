'use strict';
require('typescript-require');
var expect = require('chai').expect;

var Record = require('../lib/record.js').CBIRecord;
console.log(Record);


describe('The record class', function(){

    it('should throw on wrong record types', function(){

        try {

            new Record('666');
        }
        catch(e){
            console.log(e);
            expect(e).to.be.instanceof(Error);
            expect(e).name.to.be('Assertion error');
        }

    });

});
