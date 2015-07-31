///<reference path="../typings/tsd.d.ts"/>

import {CBIOperation} from "./CBIOperation";
import { readXML } from "./xml_utils";
import * as assert from "assert";
import * as validators from "./validators";

export enum documentType { SDDRequest, SDDStatusReport, STC };
/**
 * Class LogicalMessage
 * @class CBI.LogicalMessage
 * @classdesc A class that manages cbi logical messages
 */
export class LogicalMessage<T extends CBIOperation> {

  /**
   * The message type
   * @type {string}
   */
  private _type: documentType;

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
  get creationDateTime(){ return this.creationDateTime; };
  set creationDateTime(){ assert(); }

  /**
   * Total number of transactions
   * @type {number}
   */
  private numberOfTransactions: number;

  public constructor(){

  }

  public static fromFile
    <T extends CBIOperation>
    (xmlPath: string, OperationClass: typeof CBIOperation ):
    Bromise<LogicalMessage<T>> {

    return readXML(xmlPath, OperationClass.XSDFilepath)
    .then(function(xmlDocument){

      const lm = new LogicalMessage();


      return lm;
    });
  }
}
