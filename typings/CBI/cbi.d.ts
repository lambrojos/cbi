/// <reference path="../libxmljs/libxmljs.d.ts"/>

declare module "codice_fiscale_validator" {
    export = isCf;
}
interface isCf {
  (source: string): boolean;
}
