// Type definitions for Libxmljs
// Project: https://github.com/polotek/libxmljs
// Definitions by: François de Campredon <https://github.com/fdecampredon>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module "libxmljs-mt" {

    export function parseXmlString(source:string):Document;
    export function parseHtmlString(source:string):HTMLDocument;


    export class Document {
        validate(XSDDocument: Document):boolean;
        validationErrors: Array<Object>;

        static fromXmlAsync(buffer:Buffer, options:Object, done:(err: Error, doc:Document)=>void)
        constructor(version?:number, encoding?:string);
        child(idx:number):Element;
        childNodes():Element[];
        errors():SyntaxError[];
        encoding():string;
        encoding(enc:string):void;
        find(xpath:string):Element[];
        get(xpath:string):Element;
        node(name:string, content?:string):Element;
        root():Element;
        toString():string;
        version():Number;
    }

    export class Node {
      node(name:string, content?:string):Element;
    }

    export class HTMLDocument extends Document {

    }


    export class Element extends Node {
        constructor(doc:Document, name:string, content?:string);
        name():string;
        name(newName:string):void;
        text():string;
        attr(name:string):string;
        attr(attr:Attribute);
        attr(attrObject:{[key:string]:string;}):void;
        attrs():Attribute[];
        parent():Element;
        doc():Document;
        child(idx:number):Element;
        childNodes():Element[];
        addChild(child:Element);
        nextSibling():Element;
        nextElement():Element;
        addNextSibling(siblingNode:Element):Element;
        prevSibling():Element;
        prevElement():Element;
        addPrevSibling(siblingNode:Element);
        find(xpath:string):Element[];
        find(xpath:string, ns_uri:string):Element[];
        get(xpath:string, ns_uri:string):Element;
        find(xpath:string, namespaces:{[key:string]:string;}):Element[];
        get(xpath, ns_uri:{[key:string]:string;}):Element;
        defineNamespace(href:string):Namespace;
        defineNamespace(prefix:string, href:string):Namespace;
        namespace():Namespace;
        namespace(ns:Namespace):void;
        namespace(href:string):void;
        namespace(prefix:string, href:string):void;
        remove():void;
        path():string;
        type():string;
    }


    export class Attribute extends Node {
        constructor(node:Element, name:string, value:string);
        constructor(node:Element, name:string, value:string, ns:Namespace);
        name():string;
        namespace():Namespace;
        namespace(ns:Namespace):Namespace;
        nextSibling():Attribute;
        node():Element;
        prevSibling():Attribute;
        remove():void;
        value():string;
    }

    export class Namespace extends Node {
        constructor(node:Element, prefix:string, href:string);
        href():string;
        prefix():string;
    }

    export class SaxParser {
        parseString(source:string):boolean;
        addListener(event: string, listener: Function);
        on(event: string, listener: Function): any;
        once(event: string, listener: Function): void;
        removeListener(event: string, listener: Function): void;
        removeAllListener(event: string): void;
        setMaxListeners(n: number): void;
        listeners(event: string): { Function; }[];
        emit(event: string, arg1?: any, arg2?: any): void;
    }


    export class SaxPushParser {
        push(source:string):boolean;
        addListener(event: string, listener: Function);
        on(event: string, listener: Function): any;
        once(event: string, listener: Function): void;
        removeListener(event: string, listener: Function): void;
        removeAllListener(event: string): void;
        setMaxListeners(n: number): void;
        listeners(event: string): { Function; }[];
        emit(event: string, arg1?: any, arg2?: any): void;
    }
}
