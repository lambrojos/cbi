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
var XSDName = 'CBISDDStsRptLogMsg.00.01.00';
var rootElementName = "CBISDDStsRptLogMsg";
var namespace = 'urn:CBI:xsd:CBISDDStsRptLogMsg.00.01.00';
var SDDStatusReportDef = [
    {
        tag: 'GrpHdr', children: [
            { tag: 'MsgId', prop: 'messageIdentification' },
            { tag: 'MsgQual', prop: 'messageQualification' },
            { tag: 'CreDtTm', prop: 'creationDateTime', type: 'DateTime' },
            { tag: 'InitgPty', prop: 'initiatingParty', wrapper: initiating_party_1.InitiatingParty },
            {
                tag: 'CdtrAgt',
                children: [
                    { tag: 'FinInstnId', children: [
                            { tag: 'ClrSysMmbId', children: [
                                    { tag: 'MmbId', prop: 'creditorAgent' },]
                            }]
                    }]
            },
        ]
    },
    {
        tag: 'OrgnlGrpInfAndSts',
        children: [
            { tag: 'OrgnlMsgId', prop: 'originalMessageId' },
            { tag: 'OrgnlCreDtTm', prop: 'originalCreationDateTime', type: 'DateTime' },
            { tag: 'GrpSts', prop: 'groupStatus' },
            {
                tag: 'StsRsnInf',
                prop: 'statusReasonInformation',
                wrapper: StatusReasonInformation
            },
            {
                tag: 'NbOfTxsPerSts',
                children: [
                    { tag: 'DtldNbOfTxs', prop: 'detailedNumberOfTransactions', type: 'Number' },
                    { tag: 'DtldCtrlSum', prop: 'detailedControlSum', type: 'Number' }
                ]
            }
        ]
    },
    {
        tag: 'OrgnlPmtInfAndSts', prop: 'originalPaymentInformationAndStatuses'
    },
];
var SDDStatusReport = (function (_super) {
    __extends(SDDStatusReport, _super);
    function SDDStatusReport(doc) {
        this.elementDef = SDDStatusReportDef;
        this.XSDName = XSDName;
        this.rootNodeName = rootElementName;
        this.namespace = namespace;
        this.originalPaymentInformationAndStatuses = [];
        _super.call(this, doc);
    }
    SDDStatusReport.fromXMLFile = function (xmlPath) {
        return xml_utils_1.readXML(xmlPath, path_1.resolve(__dirname, "./xsd/" + XSDName + ".xsd"))
            .then(function (doc) {
            return new SDDStatusReport(doc);
        });
    };
    return SDDStatusReport;
})(cbi_operation_1.LogicalMessage);
exports.SDDStatusReport = SDDStatusReport;
var statusReasonInfoDef = [
    {
        tag: 'Rsn', children: [
            { tag: 'Cd', prop: 'code' },
            { tag: 'ElmRfc', prop: 'elementReference' },
            { tag: 'Prtry', prop: 'proprietaryCode' },
        ]
    },
    { tag: 'AddtlInf', prop: 'additionalInformation' },
];
var StatusReasonInformation = (function (_super) {
    __extends(StatusReasonInformation, _super);
    function StatusReasonInformation(el) {
        this.rootNodeName = 'StsRsnInf';
        this.elementDef = statusReasonInfoDef;
        this.additionalInformation = [];
        _super.call(this, el);
    }
    StatusReasonInformation.prototype.validate = function () {
        return true;
    };
    return StatusReasonInformation;
})(cbi_operation_1.ElementWrapper);
exports.StatusReasonInformation = StatusReasonInformation;
var numberOfTransactionsPerSetDef = [
    { tag: 'DtldNbOfTxs', prop: 'detailedNumberOfTransactions' },
    { tag: 'DtldCtrlSum', prop: 'detailedControlSum' }
];
var originalPaymentInformationAndStatusDef = [
    { tag: 'OrgnlPmtInfId', prop: 'originalPaymentInformationId' },
    {
        tag: 'TxInfAndSts',
        prop: 'transactionInformationAndStatuses',
        get: function (el) { return new StatusReasonInformation(el); }
    },
];
var OriginalPaymentInformationAndStatus = (function (_super) {
    __extends(OriginalPaymentInformationAndStatus, _super);
    function OriginalPaymentInformationAndStatus(el) {
        this.rootNodeName = 'OrgnlPmtInfAndSts';
        this.elementDef = originalPaymentInformationAndStatusDef;
        this.transactionInformationAndStatuses = [];
        _super.call(this, el);
    }
    OriginalPaymentInformationAndStatus.prototype.validate = function () {
        return true;
    };
    return OriginalPaymentInformationAndStatus;
})(cbi_operation_1.ElementWrapper);
exports.OriginalPaymentInformationAndStatus = OriginalPaymentInformationAndStatus;
var transactionInformationAndStatusDef = [
    { tag: 'StsId', prop: 'statusIdentification' },
    { tag: 'OrgnlInstrId', prop: 'instructionIdentification' },
    { tag: 'OrgnlEndToEndId', prop: 'endToEndIdentification' },
    { tag: 'TxSts', prop: 'transactionStatus' },
    { tag: 'StsRsnInf', children: [
            { tag: 'Orgtr', children: [
                    { tag: 'Nm', prop: 'name' },
                    { tag: 'Id', children: [
                            { tag: 'OrgId', children: [
                                    { tag: 'BICOrBEI', prop: 'BICOrBEI' },
                                    { tag: 'Othr', children: [
                                            { tag: 'Id', prop: 'otherId' }
                                        ] }
                                ] }
                        ] }
                ] },
            { tag: 'Rsn', children: [
                    { tag: 'Cd', prop: 'statusReasonCode' },
                    { tag: 'Prtry', prop: 'statusReasonProprietaryCode' },
                ] },
            { tag: 'AddtlInf', prop: 'additionalInformation' },
        ] },
    {
        tag: 'OrgnlTxRef', children: [
            {
                tag: 'Amt',
                children: [
                    { tag: 'InstdAmt', prop: 'amount', type: 'number' }
                ],
            },
            {
                tag: 'ReqdColltnDt',
                prop: 'requestedCollectionDate',
                type: 'Date'
            },
            {
                tag: 'CdtrSchmeId',
                children: [
                    { tag: 'Id', children: [
                            { tag: 'PrvtId', children: [
                                    { tag: 'Othr', children: [
                                            { tag: 'Id', prop: 'creditorSchemaId' }
                                        ] },]
                            }]
                    }]
            },
            {
                tag: 'PmtTpInf',
                children: [
                    { tag: 'SvcLvl', children: [
                            { tag: 'Cd', prop: 'serviceLevel' }
                        ] },
                    { tag: 'LclInstrm', children: [
                            { tag: 'Cd', prop: 'localInstrument' }
                        ] },
                    { tag: 'SeqTp', prop: 'sequenceType' },
                ]
            },
            { tag: 'PmtMtd', prop: 'originalPaymentMethod' },
            {
                tag: 'MndtRltdInf',
                children: [
                    { tag: 'MndtId', prop: 'originalMandateIdentification' },
                    { tag: 'DtOfSgntr', prop: 'originalDateOfSignature' }
                ]
            },
            {
                tag: 'DbtrAcct',
                children: [
                    {
                        tag: 'Id',
                        children: [
                            { tag: 'IBAN', prop: 'originalDebitorIBAN' }
                        ]
                    }
                ]
            },
            {
                tag: 'Cdtr',
                children: [
                    { tag: 'Nm', prop: 'originalCreditorName' }
                ]
            },
            {
                tag: 'CdtrAcct',
                children: [
                    { tag: 'Id',
                        children: [
                            { tag: 'IBAN', prop: 'originalCreditorIBAN' }
                        ]
                    }
                ]
            },
        ] }
];
var TransactionInformationAndStatus = (function (_super) {
    __extends(TransactionInformationAndStatus, _super);
    function TransactionInformationAndStatus(el) {
        this.rootNodeName = 'TxInfAndSts';
        this.elementDef = transactionInformationAndStatusDef;
        this.additionalInformation = [];
        _super.call(this, el);
    }
    TransactionInformationAndStatus.prototype.validate = function () {
        return true;
    };
    return TransactionInformationAndStatus;
})(cbi_operation_1.ElementWrapper);
exports.TransactionInformationAndStatus = TransactionInformationAndStatus;
