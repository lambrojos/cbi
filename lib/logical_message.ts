///<reference path="../typings/tsd.d.ts"/>

import {CBIOperation} from "./CBIOperation";
import {readXML} from "./xml_utils";
import * as libxml from 'libxmljs-mt';
import * as assert from "assert";

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


  public constructor(private transactionClass: typeof CBIOperation){}

  /**
  * Validates this message
  * (only application level validations are run)
  */
  public validate(){
    assert(this.messageIdentification);
  }

  public toXMLDoc(): XMLDoc{

    this.validate();

    //calculate checkSum and number of transactions

    let doc = new libxml.Document(),
    xsdName = this.transactionClass.XSDName;

  //public validate(): boolean{}
    const root = doc.node("CBISDDReqLogMsg")
    root.attr({
        'xmlns': `urn:CBI:xsd:${xsdName}`,
        'xmlns:uri': `urn:CBI:xsd:${xsdName} ${xsdName}.xsd`,
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
    });

    this.addHeader(root);
    return doc;
  }

  private addHeader(root: libxml.Element){

    const header = root.node('GrpHdr');
    header.node('MsgId', this.messageIdentification);
  }

  public static fromXMLDoc(doc: XMLDoc, transactionClass: typeof CBIOperation){

    let lm = new LogicalMessage(transactionClass);

    //later use vars - can be valid only after the body has been inserted
    let checkSum: number,
    nTransactions: number;

    doc.childNodes().forEach(function(rootChild: libxml.Element){

      if(rootChild.name() === "GrpHdr"){
        rootChild.childNodes().forEach(function(el){

          switch(el.name()){

            case "MsgId":
              lm.messageIdentification = el.text();
            break;

            case "CreDtTm":
              lm.creationDateTime = el.text();
            break;

            case "NbOfTxs":
              nTransactions = parseInt(el.text(),10);
            break;

            case "CtrlSum":
              checkSum = parseInt(el.text(), 10);
            break;
          }
        });
      }
    });

    assertArray([
      lm.creationDateTime,
      lm.messageIdentification,
      nTransactions,
      checkSum]);

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
