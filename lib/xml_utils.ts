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
        buffers.map(buffer => parseXMLAsync(buffer, {}))
      );
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


export function readNode(el:libxml.Element, defs:Array<cbi.ElementDef>, elementWrapper: cbi.ElementWrapper){

  if(!el) return;

  const tags = _.indexBy(defs,'tag');

  for(const childNode of el.childNodes()){

    const def = tags[ childNode.name()];

    if ( def === undefined ) continue;

    if(def.children){
      readNode(childNode, def.children, elementWrapper);
      continue;
    }

    var getValue;
    // se ho definito una funzione get la eseguo per ottenere il valore
    if (typeof def.get === 'function'){
      getValue = def.get(childNode, elementWrapper);
    }
    // altrimenti leggo il contenuto
    else{
      getValue = childNode.text();
    }

    // se il contenuto è un array faccio il push
    if(Array.isArray(elementWrapper[def.prop])){
      elementWrapper[def.prop].push(getValue);
    }
    // altrimenti sovrascrivo
    else{
      elementWrapper[def.prop] = getValue;
    }
  }
}

function setValue(def:cbi.ElementDef, el:libxml.Element, propElement:any, inst){

  /*
    Questione molto interessante: cosa succede se la mia proprietà è a sua volta un ElementWrapper?
    succede che non posso assegnarla direttamente, ma userò un set (si può pensare in futuro di stabilire
    il tipo di una proprietà nella definizione), ma in realtà possso leggerlo già dalla proprietà,
    un pò come con gli array di valori.

    Sta di fatto che non devo creare un elemento perchè ci penserà la sua chiamata ad appendToElement()
   */
  if(typeof def.set === 'function' ){

    def.set(propElement, el.node(def.tag), inst);
  }
  else{

    if(propElement instanceof cbi.ElementWrapper){
      propElement.appendToElement(el);
    }
    else el.node(def.tag, propElement);
  }
}


export function writeNode(el:libxml.Element, defs: Array<cbi.ElementDef>, elementWrapper: cbi.ElementWrapper){

  for(const def of defs){

    if(def.children){
      writeNode(el.node(def.tag), def.children,elementWrapper);
      continue;
    }

    const property = elementWrapper[def.prop];

    if( Array.isArray(property) ){
      for( const propElement of property){
        setValue(def, el, propElement, elementWrapper);
      }
    }
    else{
      setValue(def, el, property, elementWrapper);
    }
  }

}
