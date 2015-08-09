///<reference path="../typings/tsd.d.ts"/>
import * as P from 'bluebird';
import * as libxml from 'libxmljs-mt';
import {readFile} from 'fs';

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


  export function parseNode(el:libxml.Element, def:any, elementWrapper, after:any ){

    const keys = Object.keys(def);

    for(const node of el.childNodes()){

      const name = node.name();
      if (name === 'text') continue;

      
    }
  }
