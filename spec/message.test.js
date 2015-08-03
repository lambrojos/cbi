var expect = require('chai').expect;
var LogicalMessage = require('../lib/logical_message').LogicalMessage;
var SDDReq = require('../lib/SDDReq').SDDRequest;
var path = require('path');

describe('Logical message class', function() {

  it('parses and validates and xml document', function(done) {

    var xmlPath = path.resolve(__dirname, './testdata/SDDRequest.xml');

    LogicalMessage.fromXMLFile(xmlPath, SDDReq)
    .then(function(logicalMsg){

        expect(logicalMsg.messageIdentification).to.equal('20133281307140001');
        //expect(logicalMsg.creationDateTime).to.equal(new Date('2013-11-24T13:07:14+01:00'));
        done();
    });
  });

  it('creates valid xml documents', function(done) {

    var msg = new LogicalMessage(SDDReq);
    console.log(msg.toXMLDoc().toString());
    expect(msg).not.to.be.null;

    done();
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
