///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as xml from './xml_utils';
import {v4 as getUUID} from 'uuid';
import {resolve} from 'path';

import * as P from 'bluebird';
import {readFile} from 'fs';
const readFileAsync = P.promisify(readFile);
const parseXMLAsync = P.promisify(libxml.Document.fromXmlAsync);

export interface IElementWrapper {
  validate():void;
  appendToElement(el: libxml.Element);
}

export class XSDError extends Error {
  public validationErrors: Array<Object>;
  public errors: Array<any>;
}

export interface ElementDef{

  tag: string;
  prop?: string;
  children?: Array<ElementDef>

  //TODO remove those once possible
  set?: (el:libxml.Element, prop: any, instance?: ElementWrapper)=>void;
  get?: (el:libxml.Element, instance?: ElementWrapper)=>any;

  //TODO merge those two suckers
  type?: string,
  wrapper?: typeof ElementWrapper,

  isArray?: boolean,
}

export class ElementWrapper implements IElementWrapper {

  protected rootNodeName: string;
  protected elementDef: Array<ElementDef>;

  public validate(){

    throw new Error('validation not implemented');
  }

  public constructor(el?: libxml.Element){
    if(el){
      xml.readNode(el, this.elementDef, this);
    }
  }

  public appendToElement(el: libxml.Element){
    this.validate();
    xml.writeNode(el.node(this.rootNodeName), this.elementDef, this);
  }
}

export class LogicalMessage extends ElementWrapper {

  public XSDFilepath: string;
  public namespace: string;
  public rootElementName: string ;
  public XSDName: string;

  /**
   * The messages' creation date
   * @type {Date}
   */
  public creationDateTime: Date;

  /**
  * The message identification string.
  * @type {String}. If not provided it defaults to a dashless uuid v4
  */
  public messageIdentification: string;

  /**
   * Generates an id for this message. It's an UUID v4
   * without dashes
   */
  protected generateMessageIdentification(): void{
    this.messageIdentification = getUUID().replace('-','');
  }

  public appendToElement(root){
    xml.writeNode(root, this.elementDef, this);
  }

  public constructor(doc?: libxml.Document){
    this.XSDFilepath = resolve(__dirname, `./xsd/${this.XSDName}.xsd`);
    if(doc !== undefined) super(doc.root());
  }

  public validate(){



    if(!this.messageIdentification){
      this.generateMessageIdentification();
    }
  }

  public toXMLDoc(): P<libxml.Document>{

    this.validate();


    let doc = new libxml.Document(),
    xsdName = this.XSDName;
    const root = doc.node(this.rootNodeName)
    var ns = root.defineNamespace(this.namespace);
    root.namespace(ns);

    this.appendToElement(root);


    return readFileAsync(this.XSDFilepath)
    .then(function(buffer){
      return parseXMLAsync(buffer, {})
    })
    .then(function(xsdDoc){

      //HACK find a way to create al elements inside a file
      //with the f-ing root namespace
      //reparsing does that, but at which price?


      var prova = libxml.parseXmlString(doc.toString());
      console.log(prova.toString());


      if(!prova.validate(xsdDoc)){
        const err = new XSDError('Xsd validation failed invalid document');
        err.validationErrors = prova.validationErrors;
        throw err;
      }
      return prova;
    });
  }
}

export class RequestMessage extends LogicalMessage {

  public checksum: number;
  public numberOfTransactions: number;

  protected validateChecksums(numberOfTransactions: number, checksum: number){

    if(this.numberOfTransactions === undefined){
      this.numberOfTransactions = numberOfTransactions;
    }
    else if(this.numberOfTransactions !== numberOfTransactions){
      throw new Error(`Wrong number of transactions ${this.numberOfTransactions}
          should be ${numberOfTransactions}`)
    }

    if(this.checksum === undefined){
      this.checksum = checksum;
    }
    else if(this.checksum !== checksum){
      throw new Error(`Wrong transaction checksum ${this.checksum}
          should be ${checksum}`)
    }

  }
}
