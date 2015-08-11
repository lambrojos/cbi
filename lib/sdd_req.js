var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var cbi_operation_1 = require('./cbi_operation');
var path_1 = require('path');
var SDDRequest = (function (_super) {
    __extends(SDDRequest, _super);
    function SDDRequest() {
        _super.apply(this, arguments);
    }
    SDDRequest.XSDName = 'CBISDDReqLogMsg.00.01.00';
    SDDRequest.XSDFilepath = path_1.resolve(__dirname, "./xsd/" + SDDRequest.XSDName + ".xsd");
    SDDRequest.rootElementName = "CBISDDReqLogMsg";
    return SDDRequest;
})(cbi_operation_1.CBIOperation);
exports.SDDRequest = SDDRequest;
