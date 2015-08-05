///<reference path="../typings/tsd.d.ts"/>
var xml_utils_1 = require("./xml_utils");
var uuid_1 = require('uuid');
var initiatingParty_1 = require("./initiatingParty");
var libxml = require('libxmljs-mt');
var assert = require("assert");
var LogicalMessage = (function () {
    function LogicalMessage(transactionClass) {
        this.transactionClass = transactionClass;
    }
    Object.defineProperty(LogicalMessage.prototype, "creationDateTime", {
        get: function () { return this._creationDateTime; },
        set: function (date) {
            var toSet = typeof date === 'string' ?
                new Date(date) : date;
            assert(toSet);
            assert(toSet <= new Date(), 'Message creation date cannot be in the future');
            this._creationDateTime = toSet;
        },
        enumerable: true,
        configurable: true
    });
    ;
    LogicalMessage.prototype.validate = function () {
        if (!this.messageIdentification) {
            this.generateMessageIdentification();
        }
        if (!this._creationDateTime) {
            this._creationDateTime = new Date();
        }
    };
    LogicalMessage.prototype.generateMessageIdentification = function () {
        this.messageIdentification = uuid_1.v4().replace('-', '');
    };
    LogicalMessage.prototype.toXMLDoc = function () {
        this.validate();
        var doc = new libxml.Document(), xsdName = this.transactionClass.XSDName;
        var root = doc.node("CBISDDReqLogMsg");
        root.attr({
            'xmlns': "urn:CBI:xsd:" + xsdName,
            'xmlns:uri': "urn:CBI:xsd:" + xsdName + " " + xsdName + ".xsd",
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        });
        this.addHeader(root);
        return doc;
    };
    LogicalMessage.prototype.addHeader = function (root) {
        var header = root.node('GrpHdr');
        header.node('MsgId', this.messageIdentification);
        header.node('CreDtTm', this._creationDateTime.toISOString());
        this.initiatingParty.appendElement(header);
    };
    LogicalMessage.fromXMLDoc = function (doc, transactionClass) {
        var lm = new LogicalMessage(transactionClass);
        var checkSum, nTransactions;
        doc.childNodes().forEach(function (rootChild) {
            if (rootChild.name() === "GrpHdr") {
                rootChild.childNodes().forEach(function (el) {
                    switch (el.name()) {
                        case "MsgId":
                            lm.messageIdentification = el.text();
                            break;
                        case "CreDtTm":
                            lm.creationDateTime = el.text();
                            break;
                        case "NbOfTxs":
                            nTransactions = parseInt(el.text(), 10);
                            break;
                        case "CtrlSum":
                            checkSum = parseInt(el.text(), 10);
                            break;
                        case "InitgPty":
                            lm.initiatingParty = initiatingParty_1.InitiatingParty.fromElement(el);
                            break;
                    }
                });
            }
        });
        assertArray([
            lm.initiatingParty,
            lm.creationDateTime,
            lm.messageIdentification,
            nTransactions,
            checkSum]);
        return lm;
    };
    LogicalMessage.fromXMLFile = function (xmlPath, transactionClass) {
        return xml_utils_1.readXML(xmlPath, transactionClass.XSDFilepath)
            .then(function (doc) {
            return LogicalMessage.fromXMLDoc(doc, transactionClass);
        });
    };
    return LogicalMessage;
})();
exports.LogicalMessage = LogicalMessage;
function assertArray(val) {
    val.map(assert);
}
