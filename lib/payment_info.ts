///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as assert from 'assert';
import {ElementWrapper } from './cbi_operation';

type XMLDoc = libxml.Document;

const paymentInfoDef = [
  {tag: 'PmtInfId', prop: 'paymentInfoId'},
  {tag: 'PmtMtd', prop: 'paymentMethod'},
  {
    tag: 'ReqdColltnDt',
    prop: 'requestCollectionDate',
    get: val =>  new Date(val.text()),
    set: (date, el) =>  el.text(date.toISOString())
  },
  {
    tag: 'PmtTpInf',
    children: [
      { tag:'SeqTp', prop: 'sequenceType' },
      { tag: 'LclInstrm', children:[
        { tag: 'Cd', prop: 'localInstrument' }
      ]},
      { tag: 'SvcLvl', children:[
        { tag: 'Cd', prop: 'serviceLevel' }
      ]},
      { tag: 'CtgyPurp', children:[
        { tag: 'Cd', prop: 'categoryPurpose' }
      ]}
    ]
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

  public validate():void {

    assert(
      PaymentInfo.localInstrumentCodes.indexOf(this.localInstrument) >= 0,
      'Unknown local instrument '+this.localInstrument+' errcode: NARR'
    );

    assert(
      PaymentInfo.sequenceTypes.indexOf(this.sequenceType) >= 0 ,
      'Unknown sequence type '+this.sequenceType+' errcode: NARR'
    );
  }

  public constructor(el?: libxml.Element){
    this.rootNodeName = 'PmtInfo';
    this.elementDef = paymentInfoDef;
    super(el);
  }

}
