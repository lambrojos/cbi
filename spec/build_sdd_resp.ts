//this file exists becouse writing this without
//typescript class autocomplete would have been hell

import {
  SDDStatusReport,
  StatusReasonInformation,
  OriginalPaymentInformationAndStatus,
  TransactionInformationAndStatus
}

from '../lib/sdd_status_report';

import {InitiatingParty, Other} from "../lib/initiating_party";

export function getTestMessage(){

  const txInfAndStatus = new TransactionInformationAndStatus();
  txInfAndStatus.statusIdentification = '123';
  txInfAndStatus.instructionIdentification = 'originalInstructionID';
  txInfAndStatus.endToEndIdentification = 'orige2eID';
  txInfAndStatus.transactionStatus = 'RJCT';
  txInfAndStatus.name = 'NAME';
  txInfAndStatus.BICOrBEI = 'ICRAITRR5Y0';
  //txInfAndStatus.otherId = '123';
  txInfAndStatus.statusReasonCode = '123';
  //txInfAndStatus.statusReasonProprietaryCode = '123';
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

  const originalInfo = new OriginalPaymentInformationAndStatus();
  originalInfo.originalPaymentInformationId = '123';
  originalInfo.transactionInformationAndStatuses=[txInfAndStatus];

  const statusReasonInfo = new StatusReasonInformation();
  statusReasonInfo.code = '123';
  statusReasonInfo.elementReference = 'tagname';
  statusReasonInfo.additionalInformation = ['additional'];

  const other = new Other();
  other.issuer = 'CBI';
  other.identification = '12345678';

  const initiatingParty = new InitiatingParty();
  initiatingParty.name = 'my initiating party';
  initiatingParty.organizationsIDs = [
    other
  ];

  const sddStatusReport = new SDDStatusReport();
  sddStatusReport.messageIdentification = '123123';
  sddStatusReport.creationDateTime = new Date();

  sddStatusReport.messageQualification = '6';
  sddStatusReport.initiatingParty = initiatingParty;
  sddStatusReport.creditorAgent = '123';
  sddStatusReport.originalMessageId = '123';
  sddStatusReport.originalCreationDateTime = new Date();
  sddStatusReport.groupStatus = 'RJCT';
  sddStatusReport.detailedControlSum = 100;
  sddStatusReport.detailedNumberOfTransactions = 1;
  sddStatusReport.statusReasonInformation = [ statusReasonInfo ];
  sddStatusReport.originalPaymentInformationAndStatuses = [
    originalInfo
  ];

  return sddStatusReport;
}
