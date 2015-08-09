///<reference path="../typings/tsd.d.ts"/>
import * as P from 'bluebird';
import * as libxml from 'libxmljs-mt';
import {readFile} from 'fs';
import * as _ from 'lodash';
import * as cbi from './cbi_operation';

const readFileAsync = P.promisify(readFile);
const parseXMLAsync = P.promisify(libxml.Document.fromXmlAsync);

  export function readXML(xmlPath: string, xsdPath: string){

    return P.join(readFileAsync(xmlPath), readFileAsync(xsdPath))

    .then(function(buffers){

      return P.all(
        buffers.map(buffer => parseXMLAsync(buffer, {})
      ));
    })

    // break from all that sync parsing

    .then(function(docs){
      const [xmlDoc, xsdDoc] = docs;
      var isValid = xmlDoc.validate(xsdDoc);

      if(!isValid){
        const e = new Error('Invalid document.'+xmlDoc.validationErrors.toString());
      }
      return xmlDoc;
    });
  }


  /*
  {
    tag:
    prop:
    get:
    set:
  }*/

export function readNode(el:libxml.Element, defs:Array<cbi.TagDef>, elementWrapper: cbi.IElementWrapper){

  if(!el) return;

  const tags = _.indexBy(defs,'tag');

  for(const node of el.childNodes()){

    const def = tags[ node.name()];
    if ( def === undefined ) continue;

    elementWrapper[def.prop] = typeof def.get === 'function'?
      def.get(node): node.text();
  }
}

export function writeNode(el:libxml.Element, defs: Array<cbi.TagDef>, elementWrapper: cbi.IElementWrapper){

  for(const def of defs){
    if(elementWrapper[def.prop] === undefined) continue;

    if(typeof def.get === 'function' )
      def.set(el, elementWrapper[def.prop]);
    else
      el.node(def.tag, elementWrapper[def.prop]);
  }
}
