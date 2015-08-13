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

  set?: (el:libxml.Element, prop: any, instance?: ElementWrapper)=>void;
  get?: (el:libxml.Element, instance?: ElementWrapper)=>any;
  children?: Array<ElementDef>
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

  public messageIdentification: string;
  public XSDFilepath: string;
  public namespace: string;
  public rootElementName: string ;
  public XSDName: string;

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
    super(doc.root());
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
