///<reference path="../typings/tsd.d.ts"/>
import assert = require('assert');

  export enum documentType { SDDRequest, SDDStatusReport, STC };
  /**
   * Class LogicalMessage
   * @class CBI.LogicalMessage
   * @classdesc A class that manages cbi logical messages
   */
  export class LogicalMessage {

    /**
     * The message type
     * @type {string}
     */

    private _type: documentType;
    get type() { return this._type; }
    set type(type) {
      this._type = type;
    }

    public messageIdentification: string;
    public creationDateTime: Date;

    private numberOfTransactions: number;



  }
