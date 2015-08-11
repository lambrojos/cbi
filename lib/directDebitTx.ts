///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as assert from 'assert';
import {ElementWrapper } from './cbi_operation';
const IBAN = require('iban');

type XMLDoc = libxml.Document;

// questa classe sta dentro PMT Info

const directDebitTxDef = [
  { 
    tag: 'PmtId', 
    children:[
      {tag: 'InstrId', prop: 'instructionId'},
      {tag: 'EndToEndId', prop: 'e2eId'} //validate deve essere univoco ma va validato nel logical message
    ]
  },
  { 
    tag: 'InstdAmt', 
    prop: 'instructedAmount',
    get: el => {
      return {
        currency: el.attr('Ccy'),
        amount: el.text()
      }
    },
    set: (val, el) => {
        el.attr({ Ccy: val.currency });
        el.text(val.amount);
    }
  },
  { 
    tag: 'DrctDbtTx',
    children: [
      {
        tag: 'MndtRltdInf',
        children: [
          { tag: 'MndtId', prop: 'mandateIdentification' },
          { tag: 'DtOfSgntr', prop: 'dateOfSignature' }
        ]
      },
      { tag: 'Nm', prop:'creditorName' },
    ]
  },
  {
    tag: 'Dbtr',
    children: [
      { tag: 'Nm', prop: 'debitorName' }
    ]
  },
  { 
    tag: 'DbtrAcct',
    children: [
      {
        tag: 'Id',
        children: [
          {tag:'IBAN', prop: 'IBAN'}
        ]
      }
    ]
  }
];

export class DirectDebitTx extends ElementWrapper {

  private decimalPlaces(num: number):number {
    var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) { return 0; }
    return Math.max(
      0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0)
      // Adjust for scientific notation.
      - (match[2] ? +match[2] : 0)
     );
  }

  public instructionId: string;
  public e2eId: string;

  // deve essere fra 0.01 e 999999999.99
  // con massimo due decimali
  // validare che l'attributo Ccy = EUR
  public instructedAmount: Object; 

  public mandateIdentification: string;
  public dateOfSignature: Date;

  public creditorName: string;
  public debitorName: string;

  //devo validare che sia un iban valido
  public IBAN: string;

  public validate():void {

    // validazione structured amount
    assert(this.instructedAmount.amount >= 0.01, `Value ${this.instructedAmount.amount} should be greater than 0.01 (AM09)`);
    assert(this.instructedAmount.amount <= 999999999.99, `Value ${this.instructedAmount.amount} should be smaller than 999999999.99 (AM09)`);
    assert(this.decimalPlaces(this.instructedAmount.amount) <= 2, `Value ${this.instructedAmount.amount} should have 2 decimal at max (AM09)`)
    assert(this.instructedAmount.currency === 'EUR', `Value ${this.instructedAmount.currency} should be EUR (AM03)`);

    // validazione IBAN
    assert(IBAN.isValid(this.IBAN), `Value ${this.IBAN} should be a valid IBAN`);
  }

  public constructor(el?: libxml.Element) {
    this.rootNodeName = 'PmtInfo';
    this.elementDef = directDebitTxDef;
    super(el);
  }

}