///<reference path="../typings/tsd.d.ts"/>

import {CBIOperation, XSDError} from "./cbi_operation";
import {readXML} from "./xml_utils";
import {v4 as getUUID} from 'uuid';
import {InitiatingParty} from "./initiating_party";
import {PaymentInfo} from "./payment_info";
import * as libxml from 'libxmljs-mt';
import * as assert from "assert";
import * as _ from 'lodash';
import * as P from 'bluebird';
import {readFile} from 'fs';

const readFileAsync = P.promisify(readFile);
const parseXMLAsync = P.promisify(libxml.Document.fromXmlAsync);

type XMLDoc = libxml.Document;

/**
 * Class LogicalMessage
 * @class CBI.LogicalMessage
 * @classdesc A class that manages cbi logical messages
*/
export class LogicalMessage<T extends CBIOperation> {

  /**
   * The message id
   * @type {string}
   */
  public messageIdentification: string;

  public initiatingParty: InitiatingParty;

  /**
   * The messages' creation date
   * @type {Date}
   */
  private _creationDateTime: Date;
  get creationDateTime(){ return this._creationDateTime; };
  set creationDateTime(date: string|Date){

    const toSet = typeof date === 'string' ?
      new Date(date) :  date;

    assert(toSet);
    assert(toSet <= new Date(), 'Message creation date cannot be in the future')

    this._creationDateTime = toSet;
  }

  /**
   * Total number of transactions
   * @type {number}
   */
  private numberOfTransactions: number;

  private checksum: number;

  public paymentInfos: Array<PaymentInfo>;


  public constructor(private transactionClass: typeof CBIOperation){

    this.paymentInfos = [];
  }

  /**
  * Validates this message
  * (only application level validations are run)
  */
  public validate(){

    if(!this.messageIdentification){
      this.generateMessageIdentification();
    }

    if(!this._creationDateTime){
      this._creationDateTime = new Date();
    }

    //temp arrays used for uniqueness test
    const paymentInfoIds = [];
    const e2eIds = [];

    let lastLocalInstrument = null;

    for( const paymentInfo of this.paymentInfos){

      paymentInfo.validate();

      if(lastLocalInstrument && paymentInfo.localInstrument !== lastLocalInstrument){
        throw new Error('Local instrument must be the same for all payment info. errocode:NARR');
      }
      lastLocalInstrument = paymentInfo.localInstrument;

      if( paymentInfoIds.indexOf(paymentInfo.paymentInfoId) > -1){
        throw new Error('Non unique payment info id. errocode:NARR');
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
      }

    }
  }

  /**
   * Generates an id for this message. It's an UUID v4
   * without dashes
   */
  protected generateMessageIdentification(): void{
    this.messageIdentification = getUUID().replace('-','');
  }

  public toXMLDoc(): P<XMLDoc>{

    this.validate();

    let doc = new libxml.Document(),
    xsdName = this.transactionClass.XSDName;

    const root = doc.node("CBISDDReqLogMsg")

    var ns = root.defineNamespace('urn:CBI:xsd:CBISDDReqLogMsg.00.01.00');
    root.namespace(ns);

    this.addHeader(root);

    for(const paymentInfo of this.paymentInfos){
      paymentInfo.appendToElement(root);
    }

    //read and parse the xsd
    //console.log('doom kebab')
    return readFileAsync(this.transactionClass.XSDFilepath)
    .then(function(buffer){
      return parseXMLAsync(buffer, {})
    })
    .then(function(xsdDoc){

      //HACK find a way to create al elements inside a file
      //with m-fing root namespace
      //reparsing does that, but at which price?
      doc = libxml.parseXmlString(doc.toString());

    //  console.log(reparsed.toString());

      if(!doc.validate(xsdDoc)){

        const err = new XSDError('Xsd validation failed invalid document');
        err.validationErrors = doc.errors;
        throw err;
      }
      //console.log(reparsed);
      return doc;
    });

  }

  /**
   * Adds an header to the exported doc
   * @param  {libxml.Element} The root element of the exported doc
   * @return {[type]}              [description]
   */
  protected addHeader(root: libxml.Element){

    const header = root.node('GrpHdr');
    header.node('MsgId', this.messageIdentification);
    header.node('CreDtTm', this._creationDateTime.toISOString());
    header.node('NbOfTxs', this.numberOfTransactions.toString());
    header.node('CtrlSum', this.checksum.toString());

    this.initiatingParty.appendToElement(header);
  }

  /**
   * Create a new instance from an XML Document instance.
   * @param  {XMLDoc}    doc            The parsed XML file
   * @param  {typeof CBIOperation} transactionClass The type of transaction contained in this file
   * @return {[type]}                   [description]
   */
  public static fromXMLDoc(doc: XMLDoc, transactionClass: typeof CBIOperation):LogicalMessage<CBIOperation>{

    let lm = new LogicalMessage(transactionClass);

    //later use vars - can be valid only after the body has been inserted
    let checkSum: number,
    nTransactions: number;

    const childNodes = doc.childNodes();

    for(const rootChild of childNodes){

      const name = rootChild.name();

      if(name === 'text') continue;

      if(name === "GrpHdr"){

        const hdrNodes = rootChild.childNodes();

        for(const el of hdrNodes){

          const hdrName = el.name();
          if(hdrName === 'text') continue

          switch(hdrName){

            case "CreDtTm": lm.creationDateTime = el.text();
            break;

            case "MsgId": lm.messageIdentification = el.text();
            break;

            case "NbOfTxs": lm.numberOfTransactions = parseInt(el.text(), 10);
            break;

            case "CtrlSum": lm.checksum = parseInt(el.text(), 10);
            break;

            case "InitgPty": lm.initiatingParty = new InitiatingParty(el);
            break;
          }
        }
      }

      else if(name === 'PmtInf'){
        lm.paymentInfos.push(new PaymentInfo(rootChild));
      }

    }

    assertArray([
      lm.initiatingParty,
      lm.creationDateTime,
      lm.messageIdentification,
      lm.checksum,
      lm.numberOfTransactions]);

    return lm;
  }

  public static fromXMLFile
    <T extends CBIOperation>
    (xmlPath: string, transactionClass: typeof CBIOperation ):
    Promise<LogicalMessage<T>> {

    return readXML(xmlPath, transactionClass.XSDFilepath)
    .then(function(doc){
      return LogicalMessage.fromXMLDoc(doc, transactionClass);
    });
  }
}


function assertArray(val):void{
  val.map(assert);
}
