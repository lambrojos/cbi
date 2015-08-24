///<reference path="../typings/tsd.d.ts"/>
import * as P from 'bluebird';
import * as libxml from 'libxmljs-mt';
import {readFile} from 'fs';
import * as _ from 'lodash';
import * as cbi from './cbi_operation';

export interface MappedType {
  set?: (prop: any, el:libxml.Element, instance?: cbi.ElementWrapper)=>void;
  get?: (el:libxml.Element, instance?: cbi.ElementWrapper)=>any;
};

const types: { [name : string] : MappedType } = {

  'Date': {
    get: el => new Date(el.text()),
    set: (prop, element) => {
      return element.text(prop.toISOString().substring(0, 10));
    }
  },

  'DateTime': {
    get: el => new Date(el.text()),
    set: (prop, element) => {
      return element.text(prop.toISOString());
    }
  },

  'Number': {
    get: el => parseInt(el.text(), 10),
    set: (prop, el) => el.text(prop.toString())
  }
}

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

    if (def.type && types[def.type] !== undefined){
      getValue = types[def.type].get(childNode, elementWrapper);
    }
    // se ho definito una funzione get la eseguo per ottenere il valore
    else if (typeof def.get === 'function'){
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


  //empty property, insert blank
  if(typeof propElement === 'string'){
    el.node(def.tag, propElement);
  }

  else if(propElement === null){
    el.node(def.tag, '');
  }
  //there is a defined type
  else if (def.type && types[def.type] !== undefined){
    types[def.type].set(propElement, el.node(def.tag), inst);
  }

  //there is a custom setter
  else if(typeof def.set === 'function' ){
    def.set(propElement, el.node(def.tag), inst);
  }

  else if( def.wrapper && def.wrapper.prototype instanceof cbi.ElementWrapper){
    propElement.appendToElement(el);
  }
  //it's an element wrapper
  //runtime type inference is deprecated, better read from def
  //so it can be used also for getting
  else if( propElement instanceof cbi.ElementWrapper){
    propElement.appendToElement(el);
  }

}


export function writeNode(el:libxml.Element, defs: Array<cbi.ElementDef>, elementWrapper: cbi.ElementWrapper){

  for(const def of defs){

    //cosa succede se nessuno dei maledetti children ha qualcosa da scrivere?
    //un casino

    if(def.children){

      const parentNode = el.node(def.tag);

      writeNode(parentNode, def.children, elementWrapper);

      if(parentNode.childNodes().length === 0){
        parentNode.remove();
      }
    }

    const property = elementWrapper[def.prop];

    if( Array.isArray(property) || def.isArray ){
      for( const propElement of property){
        setValue(def, el, propElement, elementWrapper);
      }
    }
    else{
      setValue(def, el, property, elementWrapper);
    }
  }

}
