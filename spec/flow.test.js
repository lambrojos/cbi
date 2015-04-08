'use strict';

var expect = require('chai').expect;
var Flow = require('../lib/record').CBI.Flow;
var string = require('underscore.string');
var AssertionError = require('assertion-error');
var testFile = 'MAV.txt';

describe('The flow class', function(){

    it('is instantiable from a CBI file', function(done){


        var mavFlow = Flow.fromFile(testFile, 'MAV', function(err, flow){

            expect(err).to.be.null;

            expect(flow).to.be.instanceof(Flow);

            done();
        });

    });
});
