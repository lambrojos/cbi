var assert = require('assert');
var InitiatingParty = (function () {
    function InitiatingParty(el) {
        this.organizationsIDs = [];
        if (!el) {
            return;
        }
        for (var _i = 0, _a = el.childNodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            if (!el) {
                return;
            }
            switch (node.name()) {
                case 'Nm':
                    this.name = node.text();
                    break;
                case 'Id':
                    var childElements = node
                        .childNodes()
                        .filter(function (node) { return node.name() === 'OrgId'; })[0]
                        .childNodes();
                    for (var _b = 0; _b < childElements.length; _b++) {
                        var other = childElements[_b];
                        if (other.name() === 'Othr')
                            this.organizationsIDs.push(new Other(other));
                    }
                    break;
            }
        }
    }
    InitiatingParty.prototype.validate = function () {
        assert(this.organizationsIDs.length > 0, "Need at least one organization");
        assert(this.organizationsIDs[0].issuer === 'CBI', "First organization id must contain a CBI issued CUC code\n       value: " + this.organizationsIDs[0].issuer + "\n       errorcode: BE05");
        if (this.organizationsIDs.length > 1) {
            var notADEs = this.organizationsIDs
                .slice(1)
                .filter(function (other) { return other.issuer !== 'ADE'; });
            assert(notADEs.length === 0, "Subsequent Other instances must be ADEs,\n         errorcode: BE15");
        }
        this.organizationsIDs.forEach(function (orgID) { return orgID.validate(); });
    };
    InitiatingParty.prototype.appendElement = function (parent) {
        this.validate();
        var localRoot = parent.node('InitgPty');
        if (this.name) {
            localRoot.node('Nm', this.name);
        }
        var orgRoot = localRoot.node('Id').node('OrgId');
        for (var _i = 0, _a = this.organizationsIDs; _i < _a.length; _i++) {
            var orgId = _a[_i];
            orgId.appendElement(orgRoot);
        }
    };
    return InitiatingParty;
})();
exports.InitiatingParty = InitiatingParty;
var Other = (function () {
    function Other(otherElement) {
        if (!otherElement) {
            return;
        }
        for (var _i = 0, _a = otherElement.childNodes(); _i < _a.length; _i++) {
            var el = _a[_i];
            switch (el.name()) {
                case 'Id':
                    this.identification = el.text();
                    break;
                case 'Issr':
                    this.issuer = el.text();
                    break;
            }
        }
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
    Other.prototype.appendElement = function (parent) {
        this.validate();
        var otherNode = parent.node('Othr');
        otherNode.node('Id', this.identification);
        otherNode.node('Issr', this.issuer);
    };
    return Other;
})();
exports.Other = Other;
