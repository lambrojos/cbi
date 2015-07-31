'use strict';

var expect = require('chai').expect;
var xmlutils = require('../lib/xml_utils');
var path = require('path');

describe('the xml utils library', function() {

  it('parses and validates and xml document', function(done) {

    var xsdPath = path.resolve(__dirname, './testdata/CBISDDReqLogMsg.00.01.00.xsd');
    var xmlPath = path.resolve(__dirname, './testdata/SDDRequest.xml');

    xmlutils.readXML(xmlPath, xsdPath)
    .then(function (what) {
      done();
    })
    .catch(function(err) {
      console.log(err.message);
    });

  });
});
