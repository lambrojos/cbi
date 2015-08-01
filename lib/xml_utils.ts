///<reference path="../typings/tsd.d.ts"/>
import * as P from 'bluebird';
import * as libxml from 'libxmljs';
import {readFile} from 'fs';

const libxmlAsync = P.promisifyAll(libxml);
const readFileAsync = P.promisify(readFile);
const nextTick = P.promisify(process.nextTick);
var xml =  '<?xml version="1.0" encoding="UTF-8"?>' +
           '<root>' +
               '<child foo="bar">' +
                   '<grandchild baz="fizbuzz">grandchild content</grandchild>' +
               '</child>' +
               '<sibling>with content!</sibling>' +
           '</root>';


  export function readXML(xmlPath: string, xsdPath: string){

    return P.join(readFileAsync(xmlPath), readFileAsync(xsdPath))

    .then(function(buffers){

      const docs = buffers.map(
        buffer => libxml.parseXmlString(buffer.toString())
      );

      return docs;
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

  /*function readXML(xmlPath: string, xsdPath: string){

    return P.coroutine(function* () {

      const buffers = yield P.join(
        fs.readFileAsync(XSDPath),
        fs.readFileAsync(XMLPath)
      );

      const docs = buffers.map(function(buffer) {
        return libxml.parseXml(buffer.toString());
      });

      const xsd = docs[0];
      const xml = docs[1];

      //lets make a pause after all that parsing
      yield nextTick();

      if( !xml.validate(xsd)){

        throw new Error(
          `${XMLPath} is not a valid XML File: ${xml.validationErrors.toString()}`
        );
      }
    }
  };*/
};
