'use strict';
var expect = require('chai').expect;
var SDDRequest = require('../lib/sdd_request').SDDRequest;
var path = require('path');
var xmlPath = path.resolve(__dirname, './testdata/SDDRequest.xml');
var PaymentInfo = require('../lib/payment_info').PaymentInfo;
//var _ = require('lodash');
//var fs = require('fs');

describe('Logical message class', function() {

  it('creates valid xml documents', function(done) {

    SDDRequest.fromXMLFile(xmlPath)
    .then(function(msg){

      return msg.toXMLDoc();
    })
    .then(function(document){
      console.log(document.toString());
      done();
    }).
    catch(function (err) {
      console.log(err);
    });
  });

  it('allows only unique payment info ids inside the same document', function(done){

    SDDRequest.fromXMLFile(xmlPath)
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

  xit('should create number of transactions and checksum if not specified', function() {
  });

  it('local instrument code must be the same for the payment infos', function(done){

    SDDRequest.fromXMLFile(xmlPath)
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
});

describe('Logical Message validation on DirectDebitTx', function() {
  it('should validate e2eId uniqueness', function(done) {
    SDDRequest.fromXMLFile(xmlPath)
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

  it('should validate transaction number', function(done) {
    SDDRequest.fromXMLFile(xmlPath)
    .then(function(msg){

      // overring id to have a duplicate in tes
      msg.numberOfTransactions = 10003;
      var bad = function(){
        msg.validate();
      };

      expect(bad).to.throw('Wrong number of transactions');

      done();
    });
  });

  it('should validate transaction checksum', function(done) {
    SDDRequest.fromXMLFile(xmlPath)
    .then(function(msg){

      // overring id to have a duplicate in tes
      msg.checksum = 10003;
      var bad = function(){
        msg.validate();
      };

      expect(bad).to.throw('Wrong transaction checksum');
      done();
    });
  });

});
