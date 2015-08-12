///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as xml from './xml_utils';

export class CBIOperation {
  public static XSDName = null;
  public static XSDFilepath = null;
}

export interface IElementWrapper {
  validate():void;
  appendToElement(el: libxml.Element);
}

export interface ElementDef{

  tag: string;
  prop?: string;
  attr?: string;

  set?: (el:libxml.Element, prop: any, instance?: ElementWrapper)=>void;:qlibxml
  get?: (el:libxml.Element, instance?: ElementWrapper)=>any;

  children?: Array<ElementDef>
}

export class ElementWrapper implements IElementWrapper {

  protected rootNodeName: string;
  protected elementDef: Array<ElementDef>;

  public validate(){
    throw new Error('validation not implemented');
  }

  public constructor(el){
    xml.readNode(el, this.elementDef, this);
  }

  public appendToElement(el: libxml.Element){
    this.validate();
    xml.writeNode(el.node(this.rootNodeName), this.elementDef, this);
  }
}
