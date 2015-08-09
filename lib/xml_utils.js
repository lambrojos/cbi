///<reference path="../typings/tsd.d.ts"/>
var P = require('bluebird');
var libxml = require('libxmljs-mt');
var fs_1 = require('fs');
var readFileAsync = P.promisify(fs_1.readFile);
var parseXMLAsync = P.promisify(libxml.Document.fromXmlAsync);
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
    function parseNode(el, def, elementWrapper, after) {
        var keys = Object.keys(def);
        for (var _i = 0, _a = el.childNodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            var name_1 = node.name();
            if (name_1 === 'text')
                continue;
        }
    }
    exports.parseNode = parseNode;
}
exports.readXML = readXML;
