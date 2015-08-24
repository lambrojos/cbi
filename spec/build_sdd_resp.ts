//this file exists becouse writing this without
//typescript class autocomplete would have been hell

import {
  SDDStatusReport,
  StatusReasonInformation,
  NumberOfTransactionsPerSet,
  OriginalPaymentInformationAndStatus,
  TransactionInformationAndStatus
  }
from '../lib/sdd_status_report';

import {InitiatingParty} from "../lib/initiating_party";

export function getTestMessage(){

  const txInfAndStatus = new TransactionInformationAndStatus();
  txInfAndStatus.statusIdentification = '123';
  txInfAndStatus.instructionIdentification = 'originalInstructionID';
  txInfAndStatus.endToEndIdentification = 'orige2eID';
  txInfAndStatus.transactionStatus = '123';
  txInfAndStatus.name = 'NAME';
  txInfAndStatus.BICOrBEI = 'ICRA IT RR 5Y0';
  //txInfAndStatus.otherId = '123';
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

  const originalInfo = new OriginalPaymentInformationAndStatus();
  originalInfo.originalPaymentInformationId = '123';
  originalInfo.transactionInformationAndStatuses=[txInfAndStatus];

  const numberOfTransactionPerSet = new NumberOfTransactionsPerSet();
  numberOfTransactionPerSet.detailedControlSum = 100;

  const statusReasonInfo = new StatusReasonInformation();
  statusReasonInfo.code = '123';
  statusReasonInfo.elementReference = 'tagname';
  statusReasonInfo.additionalInformation = ['additional'];

  const initiatingParty = new InitiatingParty();

  const sddStatusReport = new SDDStatusReport();
  sddStatusReport.messageQualification = '6';
  sddStatusReport.creditorAgent = '123';
  sddStatusReport.originalMessageId = '123';
  sddStatusReport.originalCreationDateTime = new Date();
  sddStatusReport.groupStatus = 'RJCT';
  sddStatusReport.originalPaymentInformationAndStatuses = [
    originalInfo
  ];



}
