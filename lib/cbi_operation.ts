///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';

export class CBIOperation {
  public static XSDName = null;
  public static XSDFilepath = null;
}

export interface IElementWrapper {

  validate():void;
  appendToElement(el: libxml.Element);
  //new(el?: libxml.Element);
}

export interface TagDef{

  tag: string;
  prop: string;

  set?: (el:libxml.Element, prop:any)=>void;
  get?: (el:libxml.Element)=>any;

}
