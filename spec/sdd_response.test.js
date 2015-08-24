'use strict';
var testBuilder = require('./build_sdd_resp');

describe('the sdd status report', function() {

  it('creates valid xml documents', function (done) {

    const msg = testBuilder.getTestMessage();

    msg.toXMLDoc().then(function () {
      done();
    })
    .catch(function(err){
      console.log(err);
    });
  });
});
