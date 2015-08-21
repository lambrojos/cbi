var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var cbi_operation_1 = require('./cbi_operation');
var sct_tx_1 = require("./sct_tx");
var paymentInfoDef = [
    { tag: 'PmtInfId', prop: 'paymentInfoId' },
    { tag: 'PmtMtd', prop: 'paymentMethod' },
    { tag: 'BtchBookg', prop: 'batchBooking' },
    {
        tag: 'PmtTpInf',
        children: [
            { tag: 'SvcLvl', children: [
                    { tag: 'Cd', prop: 'serviceLevel' }
                ] },
        ]
    },
    {
        tag: 'ReqdExctnDt',
        prop: 'requestExecutionDate',
        get: function (val) { return new Date(val.text()); },
        set: function (date, el) { return el.text(date.toISOString().substring(0, 10)); }
    },
    {
        tag: 'Dbtr',
        children: [
            { tag: 'Nm', prop: 'debtorName' }
        ]
    },
    {
        tag: 'DbtrAcct',
        children: [
            { tag: 'Id',
                children: [
                    { tag: 'IBAN', prop: 'debtorIban' }
                ]
            }
        ]
    },
    {
        tag: 'DbtrAgt',
        children: [
            { tag: 'FinInstnId', children: [
                    { tag: 'ClrSysMmbId', children: [
                            { tag: 'MmbId', prop: 'debtorAgentABI' },]
                    }]
            }]
    },
    {
        tag: 'CdtTrfTxInf',
        prop: 'creditTransfers',
        get: function (node) { return new sct_tx_1.CreditTransferTx(node); }
    }
];
var SCTPaymentInfo = (function (_super) {
    __extends(SCTPaymentInfo, _super);
    function SCTPaymentInfo(el) {
        this.rootNodeName = 'PmtInf';
        this.elementDef = paymentInfoDef;
        this.creditTransfers = [];
        _super.call(this, el);
    }
    SCTPaymentInfo.prototype.validate = function () {
        for (var _i = 0, _a = this.creditTransfers; _i < _a.length; _i++) {
            var ct = _a[_i];
            ct.validate();
        }
    };
    return SCTPaymentInfo;
})(cbi_operation_1.ElementWrapper);
exports.SCTPaymentInfo = SCTPaymentInfo;
