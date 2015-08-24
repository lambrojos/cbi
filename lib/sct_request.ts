///<reference path="../typings/tsd.d.ts"/>

import {resolve} from 'path';
import {ElementWrapper, XSDError, RequestMessage} from "./cbi_operation";
import {readXML, writeNode} from "./xml_utils";
import {InitiatingParty} from "./initiating_party";
import {SCTPaymentInfo} from "./sct_payment_info";
import * as libxml from 'libxmljs-mt';
import * as assert from "assert";
import * as _ from 'lodash';
import * as P from 'bluebird';
import {readFile} from 'fs';

type XMLDoc = libxml.Document;

const SCTDef = [
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
  {tag: 'PmtInf', prop: 'paymentInfo', get: el => new SCTPaymentInfo(el)}
];

const XSDName = 'CBIPaymentRequest.00.04.00';
const rootElementName = "CBIPaymentRequest"
const namespace = 'urn:CBI:xsd:CBIPaymentRequest.00.04.00';
/**
 * Class LogicalMessage
 * @class CBI.LogicalMessage
 * @classdesc A class that manages cbi logical messages
*/
export class SCTRequest extends RequestMessage{


  /**
   * The message id
   * @type {string}
   */
  public initiatingParty: InitiatingParty;
  public paymentInfo: SCTPaymentInfo;

  /**
  * Validates this message
  * (only application level validations are run)
  */
  public validate(){

    super.validate();

    let numberOfTransactions = 0, checksum = 0, e2eIds = [];

    this.paymentInfo.validate();

    for (const creditTransfer of this.paymentInfo.creditTransfers) {
      if(e2eIds.indexOf(creditTransfer.e2eId) > -1){
        throw new Error('Non unique directDebtTx e2eId. errocode:NARR');
      }
      else{
        e2eIds.push(creditTransfer.e2eId);
      }

      numberOfTransactions++;
      checksum += creditTransfer.instructedAmount;
    }
    if(!this.paymentInfo.paymentInfoId){
      this.paymentInfo.paymentInfoId = this.messageIdentification;
    }

    super.validateChecksums(numberOfTransactions, checksum);
  }

  public constructor(doc?: libxml.Document){
    this.elementDef = SCTDef;
    this.XSDName = XSDName;
    this.rootNodeName = rootElementName;
    this.namespace = namespace;
    super(doc);
  }

  //TODO NOTCOOL questo dovrebbe stare nella super classe
  public static fromXMLFile(xmlPath: string ): Promise<SCTRequest> {
    return readXML(xmlPath, resolve(__dirname, `./xsd/${XSDName}.xsd`))
    .then(function(doc){
      return new SCTRequest(doc);
    });
  }
}
