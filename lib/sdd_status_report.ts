///<reference path="../typings/tsd.d.ts"/>

import {resolve} from 'path';
import {ElementWrapper, XSDError, LogicalMessage} from "./cbi_operation";
import {readXML, writeNode} from "./xml_utils";
import {InitiatingParty} from "./initiating_party";
import {SCTPaymentInfo} from "./sct_payment_info";
import * as libxml from 'libxmljs-mt';
import * as assert from "assert";
import * as _ from 'lodash';
import * as P from 'bluebird';
import {readFile} from 'fs';

type XMLDoc = libxml.Document;

const XSDName = 'CBISDDStsRptLogMsg.00.01.00';
const rootElementName = "CBISDDStsRptLogMsg"
const namespace = 'urn:CBI:xsd:CBISDDStsRptLogMsg.00.01.00';

const SDDStatusReportDef = [
  {
    tag: 'GrpHdr', children:[

      {tag: 'MsgId', prop: 'messageIdentification'},
      {tag: 'CreDtTm', prop: 'creationDateTime'},
      {tag: 'MsgQual', prop: 'messageQualification'},
      {tag: 'InitgPty', prop: 'InitiatingParty', get: el => new InitiatingParty(el)},
      {
        tag: 'CdtrAgt',
        children: [
          { tag: 'FinInstnId', children:[
            { tag: 'ClrSysMmbId', children:[
              { tag: 'MmbId', prop: 'creditorAgent' },]
            }]
        }]
      },
    ]
  },

  {
    tag: 'OrgnlGrpInfAndSts',
    children: [
      { tag: 'OrgnlMsgId', prop: 'originalMessageId' },
      { tag: 'OrgnlCreDtTm', prop: 'originalCreationDateTime' },
      { tag: 'GrpSts', prop: 'groupStatus'},
      {
        tag: 'StsRsnInf',
        prop: 'statusReasonInformation',
        get: el => new StatusReasonInformation(el)
      },
      {
        tag: 'OrgnlPmtInfAndSts', prop: 'originalPaymentInformationAndStatuses'
      }
    ]
  }
];

export class SDDStatusReport extends LogicalMessage {

  public messageQualification: string;

  public initiatingParty: InitiatingParty;

  public creditorAgent: string;

  public originalMessageId: string;

  public originalCreationDateTime: Date;

  public groupStatus: string;

  public originalPaymentInformationAndStatuses: Array<OriginalPaymentInformationAndStatus>;

  public constructor(doc?: libxml.Document){
    this.elementDef = SDDStatusReportDef;
    this.XSDName = XSDName;
    this.rootNodeName = rootElementName;
    this.namespace = namespace;
    this.originalPaymentInformationAndStatuses = [];

    super(doc);
  }

  public static fromXMLFile(xmlPath: string ): Promise<SDDStatusReport> {
    return readXML(xmlPath, resolve(__dirname, `./xsd/${XSDName}.xsd`))
    .then(function(doc){
      return new SDDStatusReport(doc);
    });
  }
}


const statusReasonInfoDef = [
  {
    tag: 'Rsn', children: [
      { tag: 'Cd', prop: 'code' },
      { tag: 'Ptry', prop: 'proprietaryCode' },
      { tag: 'ElmRfc', prop: 'elementReference' },
    ]
  },

  { tag:'AddtlInf', prop: 'additionalInformation'},
];

export class StatusReasonInformation extends ElementWrapper{

  public code: string;
  public proprietaryCode: string;
  public elementReference: string;
  public additionalInformation: Array<string>;

  public constructor(el?: libxml.Element){
    this.rootNodeName = 'StsRsnInf';
    this.elementDef = statusReasonInfoDef;
    this.additionalInformation = [];

    super(el);
  }
}

const numberOfTransactionsPerSetDef = [

  {tag: 'DtldNbOfTxs', prop: 'detailedNumberOfTransactions' },
  {tag: 'DtldCtrlSum', prop: 'detailedControlSum'}
];

export class NumberOfTransactionsPerSet extends ElementWrapper{

  public detailedNumberOfTransactions: string;
  public detailedControlSum: number;

  public constructor(el?: libxml.Element){
    this.rootNodeName = 'NbOfTxsPerSts';
    this.elementDef = numberOfTransactionsPerSetDef;

    super(el);
  }
}


const originalPaymentInformationAndStatusDef = [
  { tag: 'OrgnlPmtInfId', prop: 'originalPaymentInformationId'},
  {
    tag: 'TxInfAndSts',
    prop: 'transactionInformationAndStatuses',
    get: el => new StatusReasonInformation(el)
  },

];

export class OriginalPaymentInformationAndStatus extends ElementWrapper{

  public originalPaymentInformationId: string;
  public transactionInformationAndStatuses: Array<TransactionInformationAndStatus>;

  public constructor(el?: libxml.Element){
    this.rootNodeName = 'OrgnlPmtInfAndSts';
    this.elementDef = originalPaymentInformationAndStatusDef;
    this.transactionInformationAndStatuses = [];

    super(el);
  }
}


const transactionInformationAndStatusDef = [
  {tag:'StsId', prop: 'statusIdentification'},
  {tag:'OrgnlInstrId', prop: 'instructionIdentification'},
  {tag: 'OrgnlEndToEndId', prop: 'endToEndIdentification'},
  {tag: 'TxSts', prop: 'transactinStatus'},
  {tag: 'StsRsnInf', children: [

    //maronn
    {tag: 'Orgtr', children: [

      {tag: 'Nm', prop: 'name'},

      {tag: 'Id', children:[
        {tag: 'OrgId', children:[

          {tag: 'BICOrBEI', prop:'BICOrBEI'},

          {tag: 'Othr', children:[
            {tag: 'Id', prop: 'otherId'}
          ]}
        ]}
      ]}
    ]},

    {tag: 'Rsn', children:[

      {tag: 'Cd', prop:'statusReasonCode'},
      {tag: 'Prtry', prop:'statusReasonProprietaryCode'},
    ]},

    {tag: 'AdditionalInformation', prop: 'additionalInformation'},

  ]},

  //roba copiata dalla transazione originale
  {
    tag: 'OrgnlTxRef', children:[

    {
      tag: 'Amt',
      prop: 'amount',

      get: (el, instance) => {
        //IDEA: implementare un campo "attributes" che vada negli attributi del nodo
        //e funzioni più o meno come children?
        instance.originalCurrency = el.attr('Ccy').value();
        return parseInt(el.text(),10)
      },

      set: (val, el, instance) => {
        el.attr({ Ccy: instance.currency });
        el.text(instance.originalAmount);
      }
    },

    {
      tag: 'ReqdColltnDt',
      prop: 'requestedCollectionDate',
      get: val =>  new Date(val.text()),
      set: (date, el) =>  el.text(date.toISOString().substring(0, 10))
    },


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
      tag: 'PmtTpInf',
      children: [
        { tag: 'SvcLvl', children:[
          { tag: 'Cd', prop: 'serviceLevel' }
        ]},
        { tag: 'LclInstrm', children:[
          { tag: 'Cd', prop: 'localInstrument' }
        ]},
        { tag:'SeqTp', prop: 'sequenceType' },
      ]
    },

    { tag: 'PmtMtd', prop: 'originalPaymentMethod' },


    {
      tag: 'MndtRltdInf',
      children: [
        { tag: 'MndtId', prop: 'originalMandateIdentification' },
        { tag: 'DtOfSgntr', prop: 'originalDateOfSignature' }
      ]
    },

    {
      tag: 'DbtrAcct',
      children: [
        {
            tag: 'Id',
            children: [
                { tag: 'IBAN', prop: 'originalDebitorIBAN' }
            ]
        }
      ]
    },
    {
        tag: 'Cdtr',
        children: [
            { tag: 'Nm', prop: 'originalCreditorName' }
        ]
    },
    {
        tag: 'CdtrAcct',
        children: [
            { tag: 'Id',
                children: [
                    { tag: 'IBAN', prop: 'originalCreditorIBAN' }
                ]
            }
        ]
    },

  ]}
];

export class TransactionInformationAndStatus extends ElementWrapper {

  public statusIdentification: string;
  public instructionIdentification: string;
  public endToEndIdentification: string;
  public transactionStatus: string;
  public name: string;
  public BICOrBEI: string;
  public otherId: string;

  public statusReasonCode: string;
  public statusReasonProprietaryCode: string;
  public additionalInformation: Array<string>;

  public amount: number;
  public currency: string;
  public requestedCollectionDate: Date;
  public creditorSchemaId: string;
  public serviceLevel: string;
  public localInstrument: string;
  public sequenceType: string;
  public paymentMethod: string;
  public mandateIdentification: string;
  public dateOfSignature: Date;
  public debitorIBAN: string;
  public creditorName: string;
  public creditorIBAN: string;


  public constructor(el?: libxml.Element){
    this.rootNodeName = 'TxInfAndSts';
    this.elementDef = transactionInformationAndStatusDef;
    this.additionalInformation = [];

    super(el);
  }
}
