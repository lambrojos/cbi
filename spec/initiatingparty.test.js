'use strict';
var expect = require('chai').expect;
var Other = require('../lib/initiatingParty').Other;
var InitiatingParty = require('../lib/initiatingParty').InitiatingParty;


describe('The InitiatingParty class', function() {

  it('the first Other instance must be a CUC', function() {

    var ip = new InitiatingParty();

    var ADE = new Other();
    ip.issuer = 'ADE';
    ip.identification = 'LLEGNN86P23F205T';

    var CUC = new Other();
    ip.issuer = 'CUC';
    ip.identification = '12345678';

    ip.name = 'piergiorgio';
    var bad = function() {
      ip.organizationsIDs.push(ADE);
      ip.validate();
    };
    expect(bad).to.throw('BE05');

    ip.organizationsIDs = [];
    var good = function() {
      ip.organizationsIDs.push(CUC);
      ip.validate();
    };

    expect(good).not.to.throw;
  });

  it('if there are more than one Other instance, they must be ADEs except the first',

    function() {

      var CUC = new Other();
      CUC.issuer = 'CBI';
      CUC.identification = '123456789';

      var CUC1 = new Other();
      CUC1.issuer = 'CBIss';
      CUC1.identification = '12345678';

      var ip = new InitiatingParty();
      ip.organizationsIDs.push(CUC);
      ip.organizationsIDs.push(CUC1);

      var bad = function() {

        ip.validate();
      };

      expect(bad).to.throw('BE15')
    }
  );

  it('calls the validate function of its own Others', function() {

      var badCUC = new Other();
      badCUC.issuer = 'CBI';
      badCUC.identification = 'r123456789';

      var ip = new InitiatingParty();
      ip.organizationsIDs.push(badCUC);

      var bad = function() {
        ip.validate();
      };

      expect(bad).to.throw('NARR');
  });
});


describe('the Other class', function() {

  //c'è una domanda in corso
  it('allows only CUC or ADE', function() {

    var other = new Other();
    other.issuer = 'banana';
    other.identification = '12345678';

    var bad = function(){
      other.validate();
    };

    expect(bad).to.throw();
  });

  it('if the issr field equals CUC then the id field must contain a CUC code',
    function () {

      var other = new Other();
      other.issuer = 'CBI';
      other.identification = 'notacucforsure';

      var bad = function(){
        other.validate();
      };

      expect(bad).to.throw('NARR');

      var good = function(){
        other.identification = '12345678';
      };

      expect(good).not.to.throw();
    }
  );

  it(`if the issr field is ADE then the id field must be a codice fiscale or
      a partita IVA`,
    function(){

      var other = new Other();
      other.issuer = 'ADE';
      other.identification = 'LLEGNN86P23F205T';


      var good = function() {

        other.validate();
      };
      expect(good).not.to.throw();
      //PARTITA IVA with IT

      var good2 = function() {
        other.identification = 'IT07643520561';
        other.validate();
      };
      expect(good2).not.to.throw();

      var good3 = function() {
        other.identification = '07643520561';
        other.validate();
      };
      expect(good3).not.to.throw();


      var bad = function(){
        other.identification = 'baubaumiaomiao';
        other.validate();
      };
      expect(bad).to.throw('NARR');
    }
  );
});
