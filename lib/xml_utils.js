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
        var childNode = _a[_i];
        var def = tags[childNode.name()];
        if (def === undefined)
            continue;
        if (def.children) {
            readNode(childNode, def.children, elementWrapper);
            continue;
        }
        var getValue;
        if (typeof def.get === 'function') {
            getValue = def.get(childNode, elementWrapper);
        }
        else {
            getValue = childNode.text();
        }
        if (Array.isArray(elementWrapper[def.prop])) {
            elementWrapper[def.prop].push(getValue);
        }
        else {
            elementWrapper[def.prop] = getValue;
        }
    }
}
exports.readNode = readNode;
function writeNode(el, defs, elementWrapper) {
    for (var _i = 0; _i < defs.length; _i++) {
        var def = defs[_i];
        if (def.children) {
            return writeNode(el.node(def.tag), def.children, elementWrapper);
        }
        if (typeof def.set === 'function')
            def.set(elementWrapper[def.prop], el.node(def.tag));
        else
            el.node(def.tag, elementWrapper[def.prop]);
    }
}
exports.writeNode = writeNode;
