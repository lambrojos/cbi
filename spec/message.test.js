'use strict';
var expect = require('chai').expect;
var LogicalMessage = require('../lib/logical_message').LogicalMessage;
var SDDReq = require('../lib/sdd_req').SDDRequest;
var path = require('path');
var xmlPath = path.resolve(__dirname, './testdata/SDDRequest.xml');

describe('Logical message class', function() {

  it('parses and validates and xml document', function(done) {

    LogicalMessage.fromXMLFile(xmlPath, SDDReq)
    .then(function(logicalMsg){

      expect(logicalMsg.messageIdentification).to.equal('20133281307140001');
      done();
    });
  });

  it('creates valid xml documents', function(done) {

    LogicalMessage.fromXMLFile(xmlPath, SDDReq)
    .then(function(msg){

      expect(msg).not.to.be.null;

      //TODO trova il modo di testare che sia uguale all'originale
      console.log(msg.toXMLDoc().toString());

      done();
    });
  });

  xit('allows only unique payment info ids inside the same document', function(){


  });

  it('doesn\'t accept a future creation date', function() {

    var undertest = new LogicalMessage();
    var badOp = function() {
      undertest.creationDateTime = '2020-10-5';
    }

    var goodOp = function() {
      undertest.creationDateTime = new Date();
      undertest.creationDateTime = '2010-1-1';
    }

    expect(badOp).to.throw('Message creation date cannot be in the future');
    expect(goodOp).not.to.throw('Message creation date cannot be in the future');

  });
});
