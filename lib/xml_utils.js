///<reference path="../typings/tsd.d.ts"/>
var P = require('bluebird');
var libxml = require('libxmljs-mt');
var fs_1 = require('fs');
var _ = require('lodash');
var cbi = require('./cbi_operation');
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
function setValue(def, el, propElement, inst) {
    if (typeof def.set === 'function') {
        def.set(propElement, el.node(def.tag), inst);
    }
    else {
        if (propElement instanceof cbi.ElementWrapper) {
            propElement.appendToElement(el);
        }
        else
            el.node(def.tag, propElement);
    }
}
function writeNode(el, defs, elementWrapper) {
    for (var _i = 0; _i < defs.length; _i++) {
        var def = defs[_i];
        if (def.children) {
            writeNode(el.node(def.tag), def.children, elementWrapper);
            continue;
        }
        var property = elementWrapper[def.prop];
        if (Array.isArray(property)) {
            for (var _a = 0; _a < property.length; _a++) {
                var propElement = property[_a];
                setValue(def, el, propElement, elementWrapper);
            }
        }
        else {
            setValue(def, el, property, elementWrapper);
        }
    }
}
exports.writeNode = writeNode;
