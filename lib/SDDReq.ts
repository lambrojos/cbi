import {CBIOperation} from './CBIOperation';
import {resolve} from 'path';

export class SDDRequest extends CBIOperation{

  public static XSDName = 'CBISDDReqLogMsg.00.01.00';
  public static XSDFilepath = resolve(__dirname, `./xsd/${SDDRequest.XSDName}.xsd`);
  public static rootElementName = "CBISDDReqLogMsg";
}
