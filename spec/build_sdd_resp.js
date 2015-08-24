//this file exists becouse writing this without
//typescript class autocomplete would have been hell
var sdd_status_report_1 = require('../lib/sdd_status_report');
var initiating_party_1 = require("../lib/initiating_party");
function getTestMessage() {
    var txInfAndStatus = new sdd_status_report_1.TransactionInformationAndStatus();
    txInfAndStatus.statusIdentification = '123';
    txInfAndStatus.instructionIdentification = 'originalInstructionID';
    txInfAndStatus.endToEndIdentification = 'orige2eID';
    txInfAndStatus.transactionStatus = '123';
    txInfAndStatus.name = 'NAME';
    txInfAndStatus.BICOrBEI = 'ICRA IT RR 5Y0';
    txInfAndStatus.statusReasonCode = '123';
    txInfAndStatus.statusReasonProprietaryCode = '123';
    txInfAndStatus.additionalInformation = ['123'];
    txInfAndStatus.amount = 123;
    txInfAndStatus.currency = 'EUR';
    txInfAndStatus.requestedCollectionDate = new Date();
    txInfAndStatus.creditorSchemaId = 'aa';
    txInfAndStatus.serviceLevel = '1';
    txInfAndStatus.localInstrument = '123';
    txInfAndStatus.sequenceType = '123';
    txInfAndStatus.paymentMethod = 'string';
    txInfAndStatus.mandateIdentification = '123';
    txInfAndStatus.dateOfSignature = new Date();
    txInfAndStatus.debitorIBAN = 'IT60X0542811101000000123456';
    txInfAndStatus.creditorName = '123';
    txInfAndStatus.creditorIBAN = 'IT60X0542811101000000123456';
    var originalInfo = new sdd_status_report_1.OriginalPaymentInformationAndStatus();
    originalInfo.originalPaymentInformationId = '123';
    originalInfo.transactionInformationAndStatuses = [txInfAndStatus];
    var numberOfTransactionPerSet = new sdd_status_report_1.NumberOfTransactionsPerSet();
    numberOfTransactionPerSet.detailedControlSum = 100;
    var statusReasonInfo = new sdd_status_report_1.StatusReasonInformation();
    statusReasonInfo.code = '123';
    statusReasonInfo.elementReference = 'tagname';
    statusReasonInfo.additionalInformation = ['additional'];
    var initiatingParty = new initiating_party_1.InitiatingParty();
    var sddStatusReport = new sdd_status_report_1.SDDStatusReport();
    sddStatusReport.messageQualification = '6';
    sddStatusReport.creditorAgent = '123';
    sddStatusReport.originalMessageId = '123';
    sddStatusReport.originalCreationDateTime = new Date();
    sddStatusReport.groupStatus = 'RJCT';
    sddStatusReport.originalPaymentInformationAndStatuses = [
        originalInfo
    ];
}
exports.getTestMessage = getTestMessage;
