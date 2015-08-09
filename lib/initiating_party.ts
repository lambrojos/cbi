///<reference path="../typings/tsd.d.ts"/>
import * as libxml from 'libxmljs-mt';
import * as assert from 'assert';

type XMLDoc = libxml.Document;

//export class InitiatingParty implements libxml.IElementWrapper{
export class InitiatingParty{

  public name: string;
  public organizationsIDs: Array<Other>;


  public validate(){
    assert(this.organizationsIDs.length > 0, "Need at least one organization");
    assert(this.organizationsIDs[0].issuer === 'CBI',
      `First organization id must contain a CBI issued CUC code
       value: ${this.organizationsIDs[0].issuer}
       errorcode: BE05`);

    if(this.organizationsIDs.length > 1){

      var notADEs = this.organizationsIDs
        .slice(1)
        .filter( other => other.issuer !== 'ADE');

      assert(notADEs.length === 0,
        `Subsequent Other instances must be ADEs,
         errorcode: BE15`);
    }

    this.organizationsIDs.forEach( orgID => orgID.validate());

  }

  public constructor(el?: libxml.Element){

    this.organizationsIDs = [];

    if(!el){ return; }

    for(const node of el.childNodes()){

      if(!el){ return; }

      switch(node.name()){

        case 'Nm':
          this.name = node.text();
        break;

        case 'Id':
          const childElements =
          node
            .childNodes()
            .filter( (node) => node.name() === 'OrgId')[0]
            .childNodes();

          for( const other of childElements){
            if(other.name() === 'Othr')
              this.organizationsIDs.push(new Other(other));
          }
        break;
      }
    }
  }

  public appendElement(parent: libxml.Element){

    this.validate();
    const localRoot = parent.node('InitgPty');

    //name is optional
    if(this.name){
      localRoot.node('Nm', this.name);
    }

    const orgRoot:libxml.Element = localRoot.node('Id').node('OrgId');

    for (const orgId of this.organizationsIDs){
      orgId.appendElement(orgRoot);
    }
  }
}

export class Other{

  public identification: string
  public issuer: string;

  public validate(){

    if(this.issuer !== 'ADE' && this.issuer !== 'CBI'){

      throw new Error(`
        The issuer must be either ADE or CBI
        value: ${this.issuer}
      `);
    }

    //https://github.com/linkmesrl/codice_fiscale_validator.git
    if(this.issuer === 'CBI' && this.identification.length !== 8 ){
      throw new Error(`
        If the issuer equals CBI then the identification must be a CUC
        value: ${this.issuer}
        errcode: NARR
      `);
    }

    if(this.issuer === 'ADE' &&
      (
        ! /^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$/.test(this.identification) &&
        ! /^(IT)?[0-9]{11}$/.test(this.identification)
      )
    ){
      throw new Error(`
        If the issuer equals ADE then the identification must be a
        partita IVA or a codice fiscale
        value: ${this.identification}
        errcode: NARR
      `);
    }
  }

  public constructor(otherElement?: libxml.Element){

    if(!otherElement){ return }

    for(const el of otherElement.childNodes()){

      switch(el.name()){

        case 'Id':
          this.identification = el.text();
        break;

        case 'Issr':
          this.issuer = el.text();
        break;
      }
    }
  }

  public appendElement(parent: libxml.Element){

    this.validate();
    const otherNode = parent.node('Othr');
    otherNode.node('Id', this.identification);
    otherNode.node('Issr', this.issuer);
  }
}
