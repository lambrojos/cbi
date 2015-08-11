///<reference path="../typings/tsd.d.ts"/>

import {CBIOperation} from "./cbi_operation";
import {readXML} from "./xml_utils";
import {v4 as getUUID} from 'uuid';
import {InitiatingParty} from "./initiating_party";
import {PaymentInfo} from "./payment_info";
import * as libxml from 'libxmljs-mt';
import * as assert from "assert";
import * as _ from 'lodash';

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

    const array = _.pluck(this.paymentInfos, 'paymentInfoId');
    for( const paymentInfo of this.paymentInfos){
        if (_.uniq(array).length !== array.length) {
        throw new Error('Non unique payment info id. errocode:NARR');
      }
    }

    let lastLocalInstrument = null;
    for( const paymentInfo of this.paymentInfos){
      if(lastLocalInstrument && paymentInfo.localInstrument !== lastLocalInstrument){
        throw new Error('Local instrument must be the same for all payment info. errocode:NARR');
      }
      lastLocalInstrument = paymentInfo.localInstrument;
    }

  }

  /**
   * Generates an id for this message. It's an UUID v4
   * without dashes
   */
  protected generateMessageIdentification(): void{
    this.messageIdentification = getUUID().replace('-','');
  }

  public toXMLDoc(): XMLDoc{

    this.validate();

    let doc = new libxml.Document(),
    xsdName = this.transactionClass.XSDName;

    const root = doc.node("CBISDDReqLogMsg")
    root.attr({
      'xmlns': `urn:CBI:xsd:${xsdName}`,
      'xmlns:uri': `urn:CBI:xsd:${xsdName} ${xsdName}.xsd`,
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
    });

    this.addHeader(root);

    for(const paymentInfo of this.paymentInfos){
      paymentInfo.appendToElement(root);
    }
    return doc;
  }

  /**
   * Adds an header to the exported doc
   * @param  {libxml.Element} The root element of the exported doc
   * @return {[type]}              [description]
   */
  protected addHeader(root: libxml.Element){

    const header = root.node('GrpHdr');
    header.node('MsgId', this.messageIdentification);
    header.node('CtrlSum', this.checksum.toString());
    header.node('CreDtTm', this._creationDateTime.toISOString());
    header.node('NbOfTxs', this._creationDateTime.toISOString());

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

            case "MsgId": lm.messageIdentification = el.text();
            break;

            case "CreDtTm": lm.creationDateTime = el.text();
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
