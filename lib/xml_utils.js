///<reference path="../typings/tsd.d.ts"/>
var P = require('bluebird');
var libxmljs_mt_1 = require('libxmljs-mt');
var fs_1 = require('fs');
var readFileAsync = P.promisify(fs_1.readFile);
var parseXMLAsync = P.promisify(libxmljs_mt_1.Document.fromXmlAsync);
function readXML(xmlPath, xsdPath) {
    return P.join(readFileAsync(xmlPath), readFileAsync(xsdPath))
        .then(function (buffers) {
        return P.all(buffers.map(function (buffer) { return parseXMLAsync(buffer, {}); }));
    })
        .then(function (docs) {
        var xmlDoc = docs[0], xsdDoc = docs[1];
        var isValid = xmlDoc.validate(xsdDoc);
        if (!isValid) {
            var e = new Error('Invalid document.' + xmlDoc.validationErrors.toString());
        }
        return xmlDoc;
    });
}
exports.readXML = readXML;
;
