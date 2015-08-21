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
var sct_payment_info_1 = require("./sct_payment_info");
var SDDReqDef = [
    {
        tag: 'GrpHdr', children: [
            { tag: 'MsgId', prop: 'messageIdentification' },
            { tag: 'CreDtTm', prop: 'creationDateTime' },
            { tag: 'NbOfTxs', prop: 'numberOfTransactions',
                get: function (s) { return parseInt(s.text(), 10); },
                set: function (s, el) { return el.text(s.toString()); }
            },
            { tag: 'CtrlSum', prop: 'checksum',
                get: function (s) { return parseInt(s.text(), 10); },
                set: function (s, el) { return el.text(s.toString()); }
            },
            { tag: 'InitgPty', prop: 'InitiatingParty', get: function (el) { return new initiating_party_1.InitiatingParty(el); } },
        ]
    },
    { tag: 'PmtInf', prop: 'paymentInfo', get: function (el) { return new sct_payment_info_1.SCTPaymentInfo(el); } }
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
        this.namespace = namespace;
        _super.call(this, doc);
    }
    SCTRequest.prototype.validate = function () {
        _super.prototype.validate.call(this);
        var numberOfTransactions = 0, checksum = 0, e2eIds = [];
        this.paymentInfo.validate();
        for (var _i = 0, _a = this.paymentInfo.creditTransfers; _i < _a.length; _i++) {
            var creditTransfer = _a[_i];
            if (e2eIds.indexOf(creditTransfer.e2eId) > -1) {
                throw new Error('Non unique directDebtTx e2eId. errocode:NARR');
            }
            else {
                e2eIds.push(creditTransfer.e2eId);
            }
            numberOfTransactions++;
            checksum += creditTransfer.instructedAmount;
        }
        if (!this.paymentInfo.paymentInfoId) {
            this.paymentInfo.paymentInfoId = this.messageIdentification;
        }
        _super.prototype.validateChecksums.call(this, numberOfTransactions, checksum);
    };
    SCTRequest.fromXMLFile = function (xmlPath) {
        return xml_utils_1.readXML(xmlPath, path_1.resolve(__dirname, "./xsd/" + XSDName + ".xsd"))
            .then(function (doc) {
            return new SCTRequest(doc);
        });
    };
    return SCTRequest;
})(cbi_operation_1.RequestMessage);
exports.SCTRequest = SCTRequest;
