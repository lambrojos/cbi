var expect = require('chai').expect;
var Other = require('../lib/initiatingParty').Other;
var InitiatingParty = require('../lib/initiatingParty').InitiatingParty;


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
