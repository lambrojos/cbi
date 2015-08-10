'use strict';
var expect = require('chai').expect;
var PaymentInfo = require('../lib/payment_info').PaymentInfo;

describe('The InitiatingParty class', function() {

  var ip = new PaymentInfo();
  beforeEach(function() {
    ip.paymentInfoId = '1';
    ip.paymentMethod = 'DD';
    ip.batchBooking = true;
    ip.serviceLevel = 'SEPA';
    ip.localInstrument = 'CORE';
    ip.requestCollectionDate = new Date();
    //ip.categoryPurpose = '';
  });

  it('validates the localInstrument value against an enum', function() {

    var bad = function(){
      ip.localInstrument = 'BAD';
      ip.validate();
    };
    expect(bad).to.throw('Unknown local instrument');
  });

  it('validates the sequence type value against an enum', function() {

    var bad = function(){
      ip.sequenceType = 'BAD';
      ip.validate();
    };
    expect(bad).to.throw('Unknown sequence type');
  });

});
