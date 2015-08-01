///<reference path="../typings/tsd.d.ts"/>

import {CBIOperation} from "./CBIOperation";
import { readXML } from "./xml_utils";
import * as libxml from 'libxmljs';
import * as assert from "assert";

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


  public constructor(private transactionClass: CBIOperation){}

  /**
  * Validates this message
  * (only application level validations are run)
  */

  public toXMLDoc(): libxml.Document{

    //calculate checkSum and number of transactions

    let doc = new libxml.Document();

  //public validate(): boolean{}
    doc.node("CBISDDReqLogMsg");

    return doc;
  }

  public static fromXMLDoc(doc: libxml.Document, transactionClass: CBIOperation){

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
