var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assert = require('assert');
var cbi_operation_1 = require('./cbi_operation');
var ipDef = [
    { tag: 'Nm', prop: 'name' },
    {
        tag: 'Id',
        prop: 'organizationsIDs',
        get: function (node) {
            var organizations = [];
            var childElements = node
                .childNodes()
                .filter(function (node) { return node.name() === 'OrgId'; })[0]
                .childNodes();
            for (var _i = 0; _i < childElements.length; _i++) {
                var other = childElements[_i];
                if (other.name() === 'Othr')
                    return new Other(other);
            }
        },
        set: function (prop, el) {
            var orgRoot = el.node('OrgId');
            for (var _i = 0; _i < prop.length; _i++) {
                var orgId = prop[_i];
                orgId.appendToElement(orgRoot);
            }
        }
    }
];
var InitiatingParty = (function (_super) {
    __extends(InitiatingParty, _super);
    function InitiatingParty(el) {
        this.rootNodeName = 'InitgPty';
        this.elementDef = ipDef;
        this.organizationsIDs = [];
        _super.call(this, el);
    }
    InitiatingParty.prototype.validate = function () {
        assert(this.organizationsIDs.length > 0, "Need at least one organization");
        console.log(this.organizationsIDs);
        assert(this.organizationsIDs[0].issuer === 'CBI', "First organization id must contain a CBI issued CUC code\n       value: " + this.organizationsIDs[0].issuer + "\n       errorcode: BE05");
        if (this.organizationsIDs.length > 1) {
            var notADEs = this.organizationsIDs
                .slice(1)
                .filter(function (other) { return other.issuer !== 'ADE'; });
            assert(notADEs.length === 0, "Subsequent Other instances must be ADEs,\n         errorcode: BE15");
        }
        this.organizationsIDs.forEach(function (orgID) { return orgID.validate(); });
    };
    return InitiatingParty;
})(cbi_operation_1.ElementWrapper);
exports.InitiatingParty = InitiatingParty;
var otherDef = [
    { tag: 'Id', prop: 'identification' },
    { tag: 'Issr', prop: 'issuer' }
];
var Other = (function (_super) {
    __extends(Other, _super);
    function Other(el) {
        this.rootNodeName = 'Othr';
        this.elementDef = otherDef;
        _super.call(this, el);
    }
    Other.prototype.validate = function () {
        if (this.issuer !== 'ADE' && this.issuer !== 'CBI') {
            throw new Error("\n        The issuer must be either ADE or CBI\n        value: " + this.issuer + "\n      ");
        }
        if (this.issuer === 'CBI' && this.identification.length !== 8) {
            throw new Error("\n        If the issuer equals CBI then the identification must be a CUC\n        value: " + this.issuer + "\n        errcode: NARR\n      ");
        }
        if (this.issuer === 'ADE' &&
            (!/^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$/.test(this.identification) &&
                !/^(IT)?[0-9]{11}$/.test(this.identification))) {
            throw new Error("\n        If the issuer equals ADE then the identification must be a\n        partita IVA or a codice fiscale\n        value: " + this.identification + "\n        errcode: NARR\n      ");
        }
    };
    return Other;
})(cbi_operation_1.ElementWrapper);
exports.Other = Other;
