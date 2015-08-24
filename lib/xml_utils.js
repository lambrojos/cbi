///<reference path="../typings/tsd.d.ts"/>
var P = require('bluebird');
var libxml = require('libxmljs-mt');
var fs_1 = require('fs');
var _ = require('lodash');
var cbi = require('./cbi_operation');
;
var types = {
    'Date': {
        get: function (el) { return new Date(el.text()); },
        set: function (prop, element) {
            return element.text(prop.toISOString().substring(0, 10));
        }
    },
    'DateTime': {
        get: function (el) { return new Date(el.text()); },
        set: function (prop, element) {
            return element.text(prop.toISOString());
        }
    },
    'Number': {
        get: function (el) { return parseInt(el.text(), 10); },
        set: function (prop, el) { return el.text(prop.toString()); }
    }
};
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
        if (def.type && types[def.type] !== undefined) {
            getValue = types[def.type].get(childNode, elementWrapper);
        }
        else if (typeof def.get === 'function') {
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
    /*
      Questione molto interessante: cosa succede se la mia proprietà è a sua volta un ElementWrapper?
      succede che non posso assegnarla direttamente, ma userò un set (si può pensare in futuro di stabilire
      il tipo di una proprietà nella definizione), ma in realtà possso leggerlo già dalla proprietà,
      un pò come con gli array di valori.
  
      Sta di fatto che non devo creare un elemento perchè ci penserà la sua chiamata ad appendToElement()
     */
    if (typeof propElement === 'string') {
        el.node(def.tag, propElement);
    }
    else if (propElement === null) {
        el.node(def.tag, '');
    }
    else if (def.type && types[def.type] !== undefined) {
        types[def.type].set(propElement, el.node(def.tag), inst);
    }
    else if (typeof def.set === 'function') {
        def.set(propElement, el.node(def.tag), inst);
    }
    else if (def.wrapper && def.wrapper.prototype instanceof cbi.ElementWrapper) {
        propElement.appendToElement(el);
    }
    else if (propElement instanceof cbi.ElementWrapper) {
        propElement.appendToElement(el);
    }
}
function writeNode(el, defs, elementWrapper) {
    for (var _i = 0; _i < defs.length; _i++) {
        var def = defs[_i];
        if (def.children) {
            var parentNode = el.node(def.tag);
            writeNode(parentNode, def.children, elementWrapper);
            if (parentNode.childNodes().length === 0) {
                parentNode.remove();
            }
        }
        var property = elementWrapper[def.prop];
        if (Array.isArray(property) || def.isArray) {
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
