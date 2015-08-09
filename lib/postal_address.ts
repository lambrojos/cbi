///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as assert from 'assert';

type XMLDoc = libxml.Document;

class PostalAddress{

  public country: string;
  //0-2\
  public addressLine: Array<string>;
}
