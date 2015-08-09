///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as assert from 'assert';
import {IElementWrapper } from './cbi_operation';

type XMLDoc = libxml.Document;

export class PaymentInfo implements IElementWrapper{

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

  public validate():void {

  }

  public appendToElement(el: libxml.Element){

    this.validate();
    const pmtInfo = el.node('PmtInfo');

    pmtInfo.node('PmtInfId', this.paymentInfoId);
    pmtInfo.node('PmtMtd', this.paymentMethod);
    pmtInfo.node('PmtTpInf')
      .node('SeqTp', this.sequenceType);

    pmtInfo.node('ReqdColltnDt', this.requestCollectionDate.toISOString());
  }

  public constructor(el?: libxml.Element){

    if(!el){ return };

    for(const node of el.childNodes()){

      const name = node.name();
      switch(name){

        case 'text': continue; break;

        case 'PmtInfId': this.paymentInfoId = node.text();
        break;

        case 'PmtMtd': this.paymentMethod = node.text();
        break;

        case 'ReqdColltnDt': this.requestCollectionDate = new Date(node.text());
        break;
        //payment type info could be a class on its own?
        case 'PmtTpInf':

          for (const infoNode of node.childNodes()){

            const infoName = infoNode.name();

            switch(infoName){

              case 'text': continue; break;

              case 'SeqTp': this.sequenceType = infoNode.text();
              break;
            }
          }
        break;
      }
    }
  }

}
