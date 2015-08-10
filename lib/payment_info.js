var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var assert = require('assert');
var cbi_operation_1 = require('./cbi_operation');
var paymentInfoDef = [
    { tag: 'PmtInfId', prop: 'paymentInfoId' },
    { tag: 'PmtMtd', prop: 'paymentMethod' },
    {
        tag: 'ReqdColltnDt',
        prop: 'requestCollectionDate',
        get: function (val) { return new Date(val.text()); },
        set: function (date, el) { return el.text(date.toISOString()); }
    },
    {
        tag: 'PmtTpInf',
        children: [
            { tag: 'SeqTp', prop: 'sequenceType' },
            { tag: 'LclInstrm', children: [
                    { tag: 'Cd', prop: 'localInstrument' }
                ] },
            { tag: 'SvcLvl', children: [
                    { tag: 'Cd', prop: 'serviceLevel' }
                ] },
            { tag: 'CtgyPurp', children: [
                    { tag: 'Cd', prop: 'categoryPurpose' }
                ] }
        ]
    }
];
var PaymentInfo = (function (_super) {
    __extends(PaymentInfo, _super);
    function PaymentInfo(el) {
        this.rootNodeName = 'PmtInfo';
        this.elementDef = paymentInfoDef;
        _super.call(this, el);
    }
    PaymentInfo.prototype.validate = function () {
        assert(PaymentInfo.localInstrumentCodes.indexOf(this.localInstrument) >= 0, 'Unknown local instrument ' + this.localInstrument + ' errcode: NARR');
        assert(PaymentInfo.sequenceTypes.indexOf(this.sequenceType) >= 0, 'Unknown sequence type ' + this.sequenceType + ' errcode: NARR');
    };
    PaymentInfo.localInstrumentCodes = [
        'CORE',
        'B2B',
        'COR1'
    ];
    PaymentInfo.sequenceTypes = [
        'FRST',
        'RCUR',
        'FNAL',
        'OOFF'
    ];
    return PaymentInfo;
})(cbi_operation_1.ElementWrapper);
exports.PaymentInfo = PaymentInfo;
