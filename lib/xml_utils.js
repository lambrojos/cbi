///<reference path="../typings/tsd.d.ts"/>
var P = require('bluebird');
var libxml = require('libxmljs-mt');
var fs_1 = require('fs');
var _ = require('lodash');
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
}
exports.readXML = readXML;
function readNode(el, defs, elementWrapper) {
    if (!el)
        return;
    var tags = _.indexBy(defs, 'tag');
    for (var _i = 0, _a = el.childNodes(); _i < _a.length; _i++) {
        var node = _a[_i];
        var def = tags[node.name()];
        if (def === undefined)
            continue;
        elementWrapper[def.prop] = typeof def.get === 'function' ?
            def.get(node) : node.text();
    }
}
exports.readNode = readNode;
function writeNode(el, defs, elementWrapper) {
    for (var _i = 0; _i < defs.length; _i++) {
        var def = defs[_i];
        if (elementWrapper[def.prop] === undefined)
            continue;
        if (typeof def.get === 'function')
            def.set(el, elementWrapper[def.prop]);
        else
            el.node(def.tag, elementWrapper[def.prop]);
    }
}
exports.writeNode = writeNode;
