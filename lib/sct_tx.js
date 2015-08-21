var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var assert = require('assert');
var cbi_operation_1 = require('./cbi_operation');
var IBAN = require('iban');
var directDebitTxDef = [
    {
        tag: 'PmtId',
        children: [
            { tag: 'InstrId', prop: 'instructionId' },
            { tag: 'EndToEndId', prop: 'e2eId' }
        ]
    },
    {
        tag: 'Amt',
        children: [{
                tag: 'InstdAmt',
                prop: 'instructedAmount',
                get: function (el, instance) {
                    instance.currency = el.attr('Ccy').value();
                    return parseInt(el.text(), 10);
                },
                set: function (val, el, instance) {
                    el.attr({ Ccy: instance.currency });
                    el.text(instance.instructedAmount);
                }
            }]
    },
    {
        tag: 'Cdtr',
        children: [
            { tag: 'Nm', prop: 'debitorName' }
        ]
    },
    {
        tag: 'CdtrAcct',
        children: [
            {
                tag: 'Id',
                children: [
                    { tag: 'IBAN', prop: 'IBAN' }
                ]
            }
        ]
    }
];
var CreditTransferTx = (function (_super) {
    __extends(CreditTransferTx, _super);
    function CreditTransferTx(el) {
        this.rootNodeName = 'CdtTrfTxInf';
        this.elementDef = directDebitTxDef;
        _super.call(this, el);
    }
    CreditTransferTx.prototype.decimalPlaces = function (num) {
        var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) {
            return 0;
        }
        return Math.max(0, (match[1] ? match[1].length : 0)
            - (match[2] ? +match[2] : 0));
    };
    CreditTransferTx.prototype.validate = function () {
        assert(this.instructedAmount >= 0.01, "Value " + this.instructedAmount + " should be greater than 0.01 (AM09)");
        assert(this.instructedAmount <= 999999999.99, "Value " + this.instructedAmount + " should be smaller than 999999999.99 (AM09)");
        assert(this.decimalPlaces(this.instructedAmount) <= 2, "Value " + this.instructedAmount + " should have 2 decimal at max (AM09)");
        assert(this.currency === 'EUR', "Value " + this.currency + " should be EUR (AM03)");
        assert(IBAN.isValid(this.IBAN), "Value " + this.IBAN + " should be a valid IBAN");
    };
    return CreditTransferTx;
})(cbi_operation_1.ElementWrapper);
exports.CreditTransferTx = CreditTransferTx;
