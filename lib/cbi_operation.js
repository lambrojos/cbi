var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../typings/tsd.d.ts"/>
var libxml = require('libxmljs-mt');
var xml = require('./xml_utils');
var uuid_1 = require('uuid');
var path_1 = require('path');
var P = require('bluebird');
var fs_1 = require('fs');
var readFileAsync = P.promisify(fs_1.readFile);
var parseXMLAsync = P.promisify(libxml.Document.fromXmlAsync);
var XSDError = (function (_super) {
    __extends(XSDError, _super);
    function XSDError() {
        _super.apply(this, arguments);
    }
    return XSDError;
})(Error);
exports.XSDError = XSDError;
var ElementWrapper = (function () {
    function ElementWrapper(el) {
        if (el) {
            xml.readNode(el, this.elementDef, this);
        }
    }
    ElementWrapper.prototype.validate = function () {
        throw new Error('validation not implemented');
    };
    ElementWrapper.prototype.appendToElement = function (el) {
        this.validate();
        xml.writeNode(el.node(this.rootNodeName), this.elementDef, this);
    };
    return ElementWrapper;
})();
exports.ElementWrapper = ElementWrapper;
var LogicalMessage = (function (_super) {
    __extends(LogicalMessage, _super);
    function LogicalMessage(doc) {
        this.XSDFilepath = path_1.resolve(__dirname, "./xsd/" + this.XSDName + ".xsd");
        _super.call(this, doc.root());
    }
    LogicalMessage.prototype.generateMessageIdentification = function () {
        this.messageIdentification = uuid_1.v4().replace('-', '');
    };
    LogicalMessage.prototype.appendToElement = function (root) {
        xml.writeNode(root, this.elementDef, this);
    };
    LogicalMessage.prototype.toXMLDoc = function () {
        this.validate();
        var doc = new libxml.Document(), xsdName = this.XSDName;
        var root = doc.node(this.rootNodeName);
        var ns = root.defineNamespace(this.namespace);
        root.namespace(ns);
        this.appendToElement(root);
        return readFileAsync(this.XSDFilepath)
            .then(function (buffer) {
            return parseXMLAsync(buffer, {});
        })
            .then(function (xsdDoc) {
            var prova = libxml.parseXmlString(doc.toString());
            console.log(prova.toString());
            if (!prova.validate(xsdDoc)) {
                var err = new XSDError('Xsd validation failed invalid document');
                err.validationErrors = prova.validationErrors;
                throw err;
            }
            return prova;
        });
    };
    return LogicalMessage;
})(ElementWrapper);
exports.LogicalMessage = LogicalMessage;
