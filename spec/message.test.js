'use strict';
var expect = require('chai').expect;
var LogicalMessage = require('../lib/logical_message').LogicalMessage;
var SDDReq = require('../lib/sdd_req').SDDRequest;
var path = require('path');
var xmlPath = path.resolve(__dirname, './testdata/SDDRequest.xml');
var PaymentInfo = require('../lib/payment_info').PaymentInfo;
//var _ = require('lodash');
var fs = require('fs');

describe('Logical message class', function() {

  xit('parses and validates and xml document', function(done) {

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
      //console.log(msg.toXMLDoc().toString());

      return msg.toXMLDoc();
    })
    .then(function(document){
      console.log(document.toString());
      done();
    }).
    catch(function (err) {
      console.log(err.validationErrors);
    });
  });

  xit('allows only unique payment info ids inside the same document', function(done){

    LogicalMessage.fromXMLFile(xmlPath, SDDReq)
    .then(function(msg){

      msg.validate();

      //clone ritorna un oggetto, non un istanza di PaymentInfo  var ip = new PaymentInfo();
      var ip = new PaymentInfo();
      ip.paymentInfoId = '1';
      ip.paymentMethod = 'DD';
      ip.batchBooking = true;
      ip.serviceLevel = 'SEPA';
      ip.localInstrument = 'CORE';
      ip.requestCollectionDate = new Date();
      ip.categoryPurpose = 'what';
      ip.sequenceType = 'FRST';

      msg.paymentInfos.push(ip);

      var bad = function() {
        msg.validate();
      };

      expect(bad).to.throw('Non unique payment info id');

      done();
    });
  });

  xit('local instrument code must be coherent with service name', function() {
  });

  xit('local instrument code must be the same for the payment infos', function(done){

    LogicalMessage.fromXMLFile(xmlPath, SDDReq)
    .then(function(msg){

      msg.validate();

      msg.paymentInfos[0].localInstrument = 'B2B';

      var bad = function() {
        msg.validate();
      };

      expect(bad).to.throw('Local instrument must be the same for all payment info');

      done();
    });
  });

  xit('se amendment indicator è true e l\'original debtor agent è valorizzato come SMNDA il campo LclInstr deve essere FRST', function(){
  });


  xit('doesn\'t accept a future creation date', function() {

    var undertest = new LogicalMessage();
    var badOp = function() {
      undertest.creationDateTime = '2020-10-5';
    };

    var goodOp = function() {
      undertest.creationDateTime = new Date();
      undertest.creationDateTime = '2010-1-1';
    };

    expect(badOp).to.throw('Message creation date cannot be in the future');
    expect(goodOp).not.to.throw('Message creation date cannot be in the future');

  });
});

xdescribe('Logical Message validation on DirectDebitTx', function() {
  it('should validate e2eId uniqueness', function(done) {
    LogicalMessage.fromXMLFile(xmlPath, SDDReq)
    .then(function(msg){

      // overring id to have a duplicate in tes
      msg.paymentInfos[0].directDebt[0].e2eId = '0003';

      var bad = function(){
        msg.validate();
      };

      expect(bad).to.throw('Non unique directDebtTx e2eId. errocode:NARR');

      done();
    });
  });
});
