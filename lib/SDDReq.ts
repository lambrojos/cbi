import {CBIOperation} from './CBIOperation';
import {resolve} from 'path';

export class SDDRequest extends CBIOperation{

  public static XSDFilepath = resolve(__dirname, './xsd/CBISDDReqLogMsg.00.01.00.xsd');
  public static rootElementName = "CBISDDReqLogMsg";
}
