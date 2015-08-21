///<reference path="../typings/tsd.d.ts"/>

import {resolve} from 'path';
import {ElementWrapper, XSDError, LogicalMessage, RequestMessage} from "./cbi_operation";
import {readXML, writeNode} from "./xml_utils";
import {InitiatingParty} from "./initiating_party";
import {PaymentInfo} from "./payment_info";
import * as libxml from 'libxmljs-mt';
import * as assert from "assert";
import * as _ from 'lodash';
import * as P from 'bluebird';
import {readFile} from 'fs';


type XMLDoc = libxml.Document;

const SDDReqDef = [
  {
    tag: 'GrpHdr', children:[
      {tag: 'MsgId', prop: 'messageIdentification'},
      {tag: 'CreDtTm', prop: 'creationDateTime'},
      {tag: 'NbOfTxs', prop: 'numberOfTransactions',
        get: s => { return parseInt(s.text(), 10); },
        set: (s, el) => el.text(s.toString())
      },
      {tag: 'CtrlSum', prop: 'checksum',
        get: s => parseInt(s.text(), 10),
        set: (s, el) => el.text(s.toString())
      },
      {tag: 'InitgPty', prop: 'InitiatingParty', get: el => new InitiatingParty(el)},
    ]
  },
  {tag: 'PmtInf', prop: 'paymentInfos', get: el => new PaymentInfo(el)}
];

const XSDName = 'CBISDDReqLogMsg.00.01.00';
const rootElementName = "CBISDDReqLogMsg"

/**
 * Class SDDRequest
 * @class SDDRequest
 * @classdesc A class that manages cbi SEPA Direct Debit Requests
*/
export class SDDRequest extends RequestMessage{

  /**
   * The message id
   * @type {string}
   */
  public initiatingParty: InitiatingParty;

  /**
  * Array of payment informations
  * @type Array<PaymentInfo>
  */
  public paymentInfos: Array<PaymentInfo>;


  /**
  * Validates this message
  * (only application level validations are run)
  */
  public validate(){

    super.validate();
    //temp arrays used for uniqueness test
    const paymentInfoIds = [];
    const e2eIds = [];

    let lastLocalInstrument = null, numberOfTransactions = 0, checksum = 0;

    for( const paymentInfo of this.paymentInfos){

      paymentInfo.validate();

      if(lastLocalInstrument && paymentInfo.localInstrument !== lastLocalInstrument){
        throw new Error('Local instrument must be the same for all payment info. errocode:NARR');
      }
      lastLocalInstrument = paymentInfo.localInstrument;

      if( paymentInfoIds.indexOf(paymentInfo.paymentInfoId) > -1){

        throw new Error('Non unique payment info id. errorcode:NARR');
      }
      else{

        paymentInfoIds.push(paymentInfo.paymentInfoId);
      }

      for (const directDebt of paymentInfo.directDebt) {
        if(e2eIds.indexOf(directDebt.e2eId) > -1){
          throw new Error('Non unique directDebtTx e2eId. errocode:NARR');
        }
        else{
          e2eIds.push(directDebt.e2eId);
        }

        numberOfTransactions++;
        checksum += directDebt.instructedAmount;
      }
    }

    this.validateChecksums(numberOfTransactions, checksum);
  }

  public constructor(doc?: libxml.Document){

    this.elementDef = SDDReqDef;
    this.XSDName = XSDName;
    this.rootNodeName = rootElementName;
    this.paymentInfos = [];
    this.namespace = 'urn:CBI:xsd:CBISDDReqLogMsg.00.01.00';
    super(doc);
  }


  public static fromXMLFile(xmlPath: string ): Promise<SDDRequest> {

    return readXML(xmlPath, resolve(__dirname, `./xsd/${XSDName}.xsd`))
    .then(function(doc){
      return new SDDRequest(doc);
    });
  }
}


/*function assertArray(val):void{
  val.map(assert);
}*/
