var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var XSDError = (function (_super) {
    __extends(XSDError, _super);
    function XSDError() {
        _super.apply(this, arguments);
    }
    return XSDError;
})(Error);
exports.XSDError = XSDError;
