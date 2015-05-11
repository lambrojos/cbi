/* global before */
/* global describe */
/* global it */

'use strict';

var expect = require('chai').expect;
var Flow = require('../lib/record').CBI.Flow;
//var string = require('underscore.string');
//var AssertionError = require('assertion-error');
var path = require('path');
var fs = require('fs');
var testFileR = path.resolve(__dirname, 'MAV.txt');
var testFileW = path.resolve(__dirname, 'MAV2.txt');
//var jsdiff = require('diff');

describe('The flow class', function(){

    it('is instantiable from a CBI file', function(done){

        Flow.fromFile(testFileR, 'MAV', function(err, flow){

            expect(err).to.be.null; /*jslint ignore:line*/

            expect(flow).to.be.instanceof(Flow);

            flow.toFile(testFileW, function(err){

                   expect(err).to.be.null;

                   var before = fs.readFileSync(testFileR).toString();
                   var after = fs.readFileSync(testFileW).toString();

                   expect(after).to.equal(before);
                   done();
            });

        });
    });
});
