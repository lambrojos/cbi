///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as assert from 'assert';

type XMLDoc = libxml.Document;

class PmtInf{

//PmtInflocal root
  public paymentInfoId: string;
  public paymentMethod: string;
  public batchBooking: string;
  public paymentTypeInfo: string;

  //PmtTpInf
    //SvcLvl.Cd
  public serviceLevel: string;

    //LclInstrm.Cd
  public localInstrument: string;

    //SeqType
  public sequenceType: string;

    //CtgyPurp.Cd
  public categoryPurpose: string;

  //ReqdColltnDt
  public requestCollectionDate: Date;


}
