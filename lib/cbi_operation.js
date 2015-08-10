var xml = require('./xml_utils');
var CBIOperation = (function () {
    function CBIOperation() {
    }
    CBIOperation.XSDName = null;
    CBIOperation.XSDFilepath = null;
    return CBIOperation;
})();
exports.CBIOperation = CBIOperation;
var ElementWrapper = (function () {
    function ElementWrapper(el) {
        xml.readNode(el, this.elementDef, this);
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
