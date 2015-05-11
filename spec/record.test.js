'use strict';
var expect = require('chai').expect;
var Record = require('../lib/record').CBI.Record;
var string = require('underscore.string');
var AssertionError = require('assertion-error');
var testString = ' IM1234512345230311AZIENDA PRIVATA SPA                                                                           E      ';

describe('The record class', function(){

    it('should get the record code, and validate it', function(){
        var r1 = new Record('IM', 'MAV');
        expect(r1.code).to.equal('IM');

        var r2 = new Record(testString, 'MAV');
        expect(r2.code).to.equal('IM');

        var badCtor = function(){
            new Record('i like pizza and stuff','MAV');
        };

        expect(badCtor).to.Throw('Invalid record length');
    });

    it('validates flowtype', function(){

        var badCtor = function(){
            new Record('IM','XXX');
        };

        expect(badCtor).to.Throw('Unknown flow type XXX');
    });

    it('validates rectype', function(){

        var badCtor = function(){
            new Record('MI','BONIFICI');
        };

        expect(badCtor).to.Throw('Unknown record type MI');
    });

    it('parses raw records', function(){

        var r = new Record(testString, 'MAV');

        expect(r.fields.length).to.equal(15);

        expect(r.getField('tipo_record')).to.equal('IM');

        expect(r.getField('codice_divisa')).to.equal('E');
    });

    it('renders a string a record', function(){

        var r = new Record(testString, 'MAV');
        expect(r.toString()).to.equal(testString);
    });

    it('does not allow non existing fields insertions', function(){

        var r = new Record(testString, 'MAV');

        function bad(){

            r.setField('nonexisting', 'E');
        }

        expect(bad).to.throw('This record cannot contain a field with name nonexisting');
    });

    it('checks value length when inserting a field', function(){

        var r = new Record(testString, 'MAV');

        function bad(){

            r.setField('codice_divisa', 'EEEEEE');
        }

        expect(bad).to.throw('Invalid content length for codice_divisa');
    });

    it('allows insertion of a correct length field', function(){

        var r = new Record(testString, 'MAV');

        function bad(){

            r.setField('codice_divisa', 'E');
        }

        expect(bad).not.to.throw();

    });
});

/*
xdescribe("The append field method", function(){

    it('should reject non Field objects', function(){

        var r = new Record(testString, 'MAV');

        function badFunc(){

            r.appendField(new Array);
        }

        expect(badFunc).to.Throw('Not a Field instance');
    });
});*/
