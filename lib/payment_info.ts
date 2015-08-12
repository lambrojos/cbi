///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as assert from 'assert';
import {ElementWrapper } from './cbi_operation';
import {DirectDebitTx} from "./direct_debit_tx";

type XMLDoc = libxml.Document;

const paymentInfoDef = [
  {tag: 'PmtInfId', prop: 'paymentInfoId'},
  {tag: 'PmtMtd', prop: 'paymentMethod'},
  {tag: 'BtchBookg', prop: 'batchBooking'},
  {
    tag: 'PmtTpInf',
    children: [
      { tag: 'SvcLvl', children:[
        { tag: 'Cd', prop: 'serviceLevel' }
      ]},
      { tag: 'LclInstrm', children:[
        { tag: 'Cd', prop: 'localInstrument' }
      ]},
      { tag:'SeqTp', prop: 'sequenceType' },
    /*  { tag: 'CtgyPurp', children:[
        { tag: 'Cd', prop: 'categoryPurpose' }
      ]}*/
    ]
  },
  {
    tag: 'ReqdColltnDt',
    prop: 'requestCollectionDate',
    get: val =>  new Date(val.text()),
    set: (date, el) =>  el.text(date.toISOString().substring(0, 10))
  },
  {
    tag: 'Cdtr',
    children: [
      { tag: 'Nm', prop: 'creditorName'}
    ]
  },
  {
    tag: 'CdtrAcct',
    children:[
      { tag: 'Id',
        children:[
          { tag: 'IBAN', prop: 'creditorIban'}
        ]
      }
    ]
  },

  //CdtrAgt.FinInstnId.ClrSysMmbId.Mmbid
  {
    tag: 'CdtrAgt',
    children: [
      { tag: 'FinInstnId', children:[
        { tag: 'ClrSysMmbId', children:[
          { tag: 'MmbId', prop: 'creditorAgentABI' },]
        }]
    }]
  },
  //CdtrSchmeId.Id.PrvtId.Othr.Id
  {
    tag: 'CdtrSchmeId',
    children: [
      { tag: 'Id', children:[
        { tag: 'PrvtId', children:[
          { tag: 'Othr', children:[
            { tag: 'Id', prop: 'creditorSchemaId'}
          ]},]
        }]
    }]
  },
  {
    tag: 'DrctDbtTxInf',
    prop: 'directDebt',
    get: (node) => { return new DirectDebitTx(node); }
  }
];

export class PaymentInfo extends ElementWrapper{

  public static localInstrumentCodes = [
    'CORE',
    'B2B',
    'COR1'
  ];

  public static sequenceTypes = [
    'FRST',
    'RCUR',
    'FNAL',
    'OOFF'
  ];

//PmtInflocal root
  public paymentInfoId: string;
  public paymentMethod: string;
  public batchBooking: string;
  public paymentTypeInfo: string;

  //PmtTpInf
    //SvcLvl.Cd
  public serviceLevel: string;

    //LclInstrm.Cd
  public localInstrument: string;

    //SeqType
  public sequenceType: string;

    //CtgyPurp.Cd
  public categoryPurpose: string;

  //ReqdColltnDt
  public requestCollectionDate: Date;


  //Cdtr

  //Cdtr.Nm
  /**
   * The name of the creditor
   * @type {string}
   */
  public creditorName: string;

  //CdtrAcct

  //CdtrAcct.Id.IBAN
  /**
   * coordinate bancarie del creditore
   * @type {string}
   */
  public creditorIban: string;

  //CdtrAgt

  //CdtrAgt.FinInstnId.ClrSysMmbId.Mmbid
  /**
   * the ABI of the creditor agent
   * @type {[type]}
   */
  public creditorAgentABI: string;


  //CdtrSchmeId
  //CdtrSchmeId.Id.PrvtId.Othr.Id
  public creditorSchemaId: string;


  public directDebt: Array<DirectDebitTx>;


  public validate():void {

    assert(
      PaymentInfo.localInstrumentCodes.indexOf(this.localInstrument) >= 0,
      'Unknown local instrument '+this.localInstrument+' errcode: NARR'
    );

    assert(
      PaymentInfo.sequenceTypes.indexOf(this.sequenceType) >= 0 ,
      'Unknown sequence type '+this.sequenceType+' errcode: NARR'
    );

    for (let dd of this.directDebt) {
      dd.validate();
    }
  }

  public constructor(el?: libxml.Element){
    this.rootNodeName = 'PmtInf';
    this.elementDef = paymentInfoDef;
    this.directDebt = [];
    super(el);
  }

}
