'use strict';
var expect = require('chai').expect;
var DirectDebitTx = require('../lib/direct_debit_tx').DirectDebitTx;

describe('The DirectDebitTx class', function() {

  var ddtx = new DirectDebitTx();
  beforeEach(function() {
    ddtx.instructedAmount = 70;
    ddtx.currency = 'EUR';
    ddtx.IBAN = 'IT47U0296247580045695325159';
  });

  it('validates the instructedAmount currency', function() {

    var bad = function(){
      ddtx.currency = 'USD';
      ddtx.validate();
    };
    expect(bad).to.throw('Value USD should be EUR (AM03)');
  });

  it('validate the instructedAmount min amount', function() {
    var bad = function(){
      ddtx.instructedAmount = 0;
      ddtx.validate();
    };
    expect(bad).to.throw('Value 0 should be greater than 0.01 (AM09)');
  });

  it('validate the instructedAmount max amount', function() {
    var bad = function(){
      ddtx.instructedAmount = 1999999999.99;
      ddtx.validate();
    };
    expect(bad).to.throw('Value 1999999999.99 should be smaller than 999999999.99 (AM09)');
  });

  it('validate 2 decimal on instructedAmount amount', function() {
    var bad = function(){
      ddtx.instructedAmount = 1.999;
      ddtx.validate();
    };
    expect(bad).to.throw('Value 1.999 should have 2 decimal at max (AM09)');
  });

  it('should not validate a wrong IBAN', function(){
    var bad = function(){
      ddtx.IBAN = 'nOnSoNoUnIbAn';
      ddtx.validate();
    };
    expect(bad).to.throw('Value nOnSoNoUnIbAn should be a valid IBAN');
  });

  it('should validate a correct amount', function(){
    var good = function(){
      ddtx.instructedAmount = 1.99;
      ddtx.validate();
    };
    expect(good).to.not.throw();
  });

});
