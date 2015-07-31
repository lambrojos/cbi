'use strict';

var expect = require('chai').expect;
var LogicalMessage = require('../lib/logical_message').LogicalMessage;
var SDDReq = require('../lib/SDDReq').SDDRequest;
var path = require('path');

describe('Logical message class', function() {

  it('parses and validates and xml document', function(done) {

    var xmlPath = path.resolve(__dirname, './testdata/SDDRequest.xml');

    LogicalMessage.fromFile(xmlPath, SDDReq)
    .then(function(logicalMsg){
        console.log(logicalMsg);
        done();
    });
  });
});
