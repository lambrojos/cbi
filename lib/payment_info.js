var PaymentInfo = (function () {
    function PaymentInfo(el) {
        if (!el) {
            return;
        }
        ;
        for (var _i = 0, _a = el.childNodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            var name_1 = node.name();
            switch (name_1) {
                case 'text':
                    continue;
                    break;
                case 'PmtInfId':
                    this.paymentInfoId = node.text();
                    break;
                case 'PmtMtd':
                    this.paymentMethod = node.text();
                    break;
                case 'ReqdColltnDt':
                    this.requestCollectionDate = new Date(node.text());
                    break;
                case 'PmtTpInf':
                    for (var _b = 0, _c = node.childNodes(); _b < _c.length; _b++) {
                        var infoNode = _c[_b];
                        var infoName = infoNode.name();
                        switch (infoName) {
                            case 'text':
                                continue;
                                break;
                            case 'SeqTp':
                                this.sequenceType = infoNode.text();
                                break;
                        }
                    }
                    break;
            }
        }
    }
    PaymentInfo.prototype.validate = function () {
    };
    PaymentInfo.prototype.appendToElement = function (el) {
        this.validate();
        var pmtInfo = el.node('PmtInfo');
        pmtInfo.node('PmtInfId', this.paymentInfoId);
        pmtInfo.node('PmtMtd', this.paymentMethod);
        pmtInfo.node('PmtTpInf')
            .node('SeqTp', this.sequenceType);
        pmtInfo.node('ReqdColltnDt', this.requestCollectionDate.toISOString());
    };
    return PaymentInfo;
})();
exports.PaymentInfo = PaymentInfo;
