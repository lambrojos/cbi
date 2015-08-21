'use strict';
var SCTRequest = require('../lib/sct_request').SCTRequest;
var path = require('path');
var xmlPath = path.resolve(__dirname, './testdata/SCTRequest.xml');
//var PaymentInfo = require('../lib/payment_info').PaymentInfo;
//var _ = require('lodash');
//var fs = require('fs');

describe('Logical sct request message class', function() {

  it('creates valid xml documents', function(done) {

    SCTRequest.fromXMLFile(xmlPath)
    .then(function(msg){
      return msg.toXMLDoc();
    })
    .then(function(document){
      console.log(document.toString());
      done();
    })
    .catch(function (err) {
      console.log(err.stack);
    });
  });

});
