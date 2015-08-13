///<reference path="../typings/tsd.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path_1 = require('path');
var cbi_operation_1 = require("./cbi_operation");
var xml_utils_1 = require("./xml_utils");
var initiating_party_1 = require("./initiating_party");
var SDDReqDef = [
    {
        tag: 'GrpHdr', children: [
            { tag: 'MsgId', prop: 'messageIdentification' },
            { tag: 'CreDtTm', prop: 'creationDateTime' },
            { tag: 'NbOfTxs', prop: 'numberOfTransactions',
                get: function (s) { return parseInt(s, 10); },
                set: function (s, el) { return el.text(s.toString()); }
            },
            { tag: 'CtrlSum', prop: 'checksum',
                get: function (s) { return parseInt(s, 10); },
                set: function (s, el) { return el.text(s.toString()); }
            },
            { tag: 'InitgPty', prop: 'InitiatingParty', get: function (el) { return new initiating_party_1.InitiatingParty(el); } },
        ]
    }
];
var XSDName = 'CBIPaymentRequest.00.04.00';
var rootElementName = "CBIPaymentRequest";
var namespace = 'urn:CBI:xsd:CBIPaymentRequest.00.04.00';
var SCTRequest = (function (_super) {
    __extends(SCTRequest, _super);
    function SCTRequest(doc) {
        this.elementDef = SDDReqDef;
        this.XSDName = XSDName;
        this.rootNodeName = rootElementName;
        this.paymentInfos = [];
        this.namespace = namespace;
        _super.call(this, doc);
    }
    SCTRequest.prototype.validate = function () {
        if (!this.messageIdentification) {
            this.generateMessageIdentification();
        }
        var paymentInfoIds = [];
        var e2eIds = [];
        var lastLocalInstrument = null, numberOfTransactions = 0, checksum = 0;
        for (var _i = 0, _a = this.paymentInfos; _i < _a.length; _i++) {
            var paymentInfo = _a[_i];
            paymentInfo.validate();
            if (lastLocalInstrument && paymentInfo.localInstrument !== lastLocalInstrument) {
                throw new Error('Local instrument must be the same for all payment info. errocode:NARR');
            }
            lastLocalInstrument = paymentInfo.localInstrument;
            if (paymentInfoIds.indexOf(paymentInfo.paymentInfoId) > -1) {
                throw new Error('Non unique payment info id. errorcode:NARR');
            }
            else {
                paymentInfoIds.push(paymentInfo.paymentInfoId);
            }
            for (var _b = 0, _c = paymentInfo.directDebt; _b < _c.length; _b++) {
                var directDebt = _c[_b];
                if (e2eIds.indexOf(directDebt.e2eId) > -1) {
                    throw new Error('Non unique directDebtTx e2eId. errocode:NARR');
                }
                else {
                    e2eIds.push(directDebt.e2eId);
                }
                numberOfTransactions++;
                checksum += directDebt.instructedAmount;
            }
        }
        if (!this.numberOfTransactions) {
            this.numberOfTransactions = numberOfTransactions;
        }
        else if (this.numberOfTransactions !== numberOfTransactions) {
            throw new Error("Wrong number of transactions " + this.numberOfTransactions + "\n          should be " + numberOfTransactions);
        }
        if (!this.checksum) {
            this.checksum = checksum;
        }
        else if (this.checksum !== checksum) {
            throw new Error("Wrong transaction checksum " + this.checksum + "\n          should be " + checksum);
        }
    };
    SCTRequest.fromXMLFile = function (xmlPath) {
        return xml_utils_1.readXML(xmlPath, path_1.resolve(__dirname, "./xsd/" + XSDName + ".xsd"))
            .then(function (doc) {
            return new SCTRequest(doc);
        });
    };
    return SCTRequest;
})(cbi_operation_1.LogicalMessage);
exports.SCTRequest = SCTRequest;
