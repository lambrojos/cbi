///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as assert from 'assert';
import {ElementWrapper } from './cbi_operation';
import {CreditTransferTx} from "./sct_tx";

type XMLDoc = libxml.Document;

const paymentInfoDef = [
  //ok
  {tag: 'PmtInfId', prop: 'paymentInfoId'},

  //ok
  {tag: 'PmtMtd', prop: 'paymentMethod'},

  //ok
  {tag: 'BtchBookg', prop: 'batchBooking'},
  {
    tag: 'PmtTpInf',
    children: [

      //ok
      { tag: 'SvcLvl', children:[
        { tag: 'Cd', prop: 'serviceLevel' }
      ]},
    ]
  },
      //ok
  {
    tag:'ReqdExctnDt',
    prop: 'requestExecutionDate',
    get: val =>  new Date(val.text()),
    set: (date, el) =>  el.text(date.toISOString().substring(0, 10))
  },
  {
    tag: 'Dbtr',
    children: [
      { tag: 'Nm', prop: 'debtorName'}
    ]
  },
  {
    tag: 'DbtrAcct',
    children:[
      { tag: 'Id',
        children:[
          { tag: 'IBAN', prop: 'debtorIban'}
        ]
      }
    ]
  },

  {
    tag: 'DbtrAgt',
    children: [
      { tag: 'FinInstnId', children:[
        { tag: 'ClrSysMmbId', children:[
          { tag: 'MmbId', prop: 'debtorAgentABI' },]
        }]
    }]
  },

/*  {
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
*/
  {
    tag: 'CdtTrfTxInf',
    prop: 'creditTransfers',
    get: (node) => { return new CreditTransferTx(node); }
  }
];

export class SCTPaymentInfo extends ElementWrapper{
/*
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
*/
//PmtInflocal root
  public paymentInfoId: string;
  public paymentMethod: string;
  public batchBooking: string;
  public paymentTypeInfo: string;

  //PmtTpInf
    //SvcLvl.Cd
  public serviceLevel: string;

    //CtgyPurp.Cd
  public categoryPurpose: string;

  //ReqdColltnDt
  public requestExecutionDate: Date;


  //Cdtr

  //Cdtr.Nm
  /**
   * The name of the creditor
   * @type {string}
   */
  public debtorName: string;

  //CdtrAcct

  //CdtrAcct.Id.IBAN
  /**
   * coordinate bancarie del creditore
   * @type {string}
   */
  public debtorIban: string;

  //CdtrAgt

  //CdtrAgt.FinInstnId.ClrSysMmbId.Mmbid
  /**
   * the ABI of the creditor agent
   * @type {[type]}
   */
  public debtorAgentABI: string;


  //CdtrSchmeId
  //CdtrSchmeId.Id.PrvtId.Othr.Id
  public creditorSchemaId: string;

  public creditTransfers: Array<CreditTransferTx>;

  public validate():void {

    for (let ct of this.creditTransfers) {
      ct.validate();
    }
  }

  public constructor(el?: libxml.Element){
    this.rootNodeName = 'PmtInf';
    this.elementDef = paymentInfoDef;
    this.creditTransfers = [];
    super(el);
  }
}
