///<reference path="../typings/tsd.d.ts"/>
var xml_utils_1 = require("./xml_utils");
var uuid_1 = require('uuid');
var initiating_party_1 = require("./initiating_party");
var payment_info_1 = require("./payment_info");
var libxml = require('libxmljs-mt');
var assert = require("assert");
var LogicalMessage = (function () {
    function LogicalMessage(transactionClass) {
        this.transactionClass = transactionClass;
        this.paymentInfos = [];
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
        for (var _i = 0, _a = this.paymentInfos; _i < _a.length; _i++) {
            var paymentInfo = _a[_i];
            paymentInfo.appendToElement(root);
        }
        return doc;
    };
    LogicalMessage.prototype.addHeader = function (root) {
        var header = root.node('GrpHdr');
        header.node('MsgId', this.messageIdentification);
        header.node('CtrlSum', this.checksum.toString());
        header.node('CreDtTm', this._creationDateTime.toISOString());
        header.node('NbOfTxs', this._creationDateTime.toISOString());
        this.initiatingParty.appendToElement(header);
    };
    LogicalMessage.fromXMLDoc = function (doc, transactionClass) {
        var lm = new LogicalMessage(transactionClass);
        var checkSum, nTransactions;
        var childNodes = doc.childNodes();
        for (var _i = 0; _i < childNodes.length; _i++) {
            var rootChild = childNodes[_i];
            var name_1 = rootChild.name();
            if (name_1 === 'text')
                continue;
            if (name_1 === "GrpHdr") {
                var hdrNodes = rootChild.childNodes();
                for (var _a = 0; _a < hdrNodes.length; _a++) {
                    var el = hdrNodes[_a];
                    var hdrName = el.name();
                    if (hdrName === 'text')
                        continue;
                    switch (hdrName) {
                        case "MsgId":
                            lm.messageIdentification = el.text();
                            break;
                        case "CreDtTm":
                            lm.creationDateTime = el.text();
                            break;
                        case "NbOfTxs":
                            lm.numberOfTransactions = parseInt(el.text(), 10);
                            break;
                        case "CtrlSum":
                            lm.checksum = parseInt(el.text(), 10);
                            break;
                        case "InitgPty":
                            lm.initiatingParty = new initiating_party_1.InitiatingParty(el);
                            break;
                    }
                }
            }
            else if (name_1 === 'PmtInf') {
                lm.paymentInfos.push(new payment_info_1.PaymentInfo(rootChild));
            }
        }
        assertArray([
            lm.initiatingParty,
            lm.creationDateTime,
            lm.messageIdentification,
            lm.checksum,
            lm.numberOfTransactions]);
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
