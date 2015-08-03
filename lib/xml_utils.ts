///<reference path="../typings/tsd.d.ts"/>
import * as P from 'bluebird';
import {Document} from 'libxmljs-mt';
import {readFile} from 'fs';

const readFileAsync = P.promisify(readFile);
const parseXMLAsync = P.promisify(Document.fromXmlAsync);

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
