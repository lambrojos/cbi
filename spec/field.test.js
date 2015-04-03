'use strict';
var expect = require('chai').expect;
var Field = require('../lib/record').CBI.Field;

describe('The field class', function(){

    it('should validate length params', function(){

        var badCtor = function(){

            return new Field(-1, 224, 'pippo');
        };


        expect(badCtor).to.Throw(Error);

        var badCtor2 = function(){

            return new Field(1, 2.24, 'pippo');
        };

        expect(badCtor2).to.Throw(Error);

        var badCtor3 = function(){

            return new Field(224, 1, 'pippo');
        };

        expect(badCtor3).to.Throw(Error);

        var badCtor4 = function(){

            return new Field(1, 14, 'pippo');
        };

        expect(badCtor4).not.to.Throw(Error);
    });

    it('should calculate the value of the length field', function(){

        var f = new Field(2, 4);
        expect(f.length).to.equal(3);
    });

    it('should generate content if not provideded', function(){

        var f2 = new Field(3,4);

        expect(f2.toString()).to.equal('  ');
    });
});
