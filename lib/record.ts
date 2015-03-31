///<reference path="../typings/tsd.d.ts"/>

import assert = require('assert');
import CBIStructs = require('./record_mapping');
import s = require('underscore.string');
import lazy = require('lazy.js');

export module CBI{

    export class Field {

        get length(): number {
            return this.to - this.from + 1;
        }

        get name(): string{ return this._name; }

        constructor(

            private from : number,
            private to : number,
            private _name : string,
            private content? : string) {

            assert(this.validatePosition(from),'Invalid from param');
            assert(this.validatePosition(to), 'Invalid to param');

            if(this.length <= 0){

                throw new Error('Invalid from/to params');
            }

            this.content = content ? content : s.repeat(' ', this.length);
        }


        private validatePosition(val : number):Boolean{

            return (typeof val === 'number') && (val % 1 === 0) && ( val>0 );
        }


       public toString():string { return this.content; }
    }


    export class Record {

        private _fields : Array<Field>;
        get fields(): Array<Field>{ return this._fields; }

        //usata solo internamente per ottimizzare la chiamate a lazy.js
        private _lazyFields: LazyJS.ArrayLikeSequence<Field> ;

        private _code : string;
        get code(): string { return this._code;}

        public static RAW_RECORD_LENGTH: number = 120;

        constructor (recordType: string, flowType: string){

            var code: string;

            switch(recordType.length){

                //only the type was specified
                case 2 :
                    this._code = recordType;
                break;

                //we are reading a raw record
                case Record.RAW_RECORD_LENGTH :
                    this._code = recordType.substring(1,3);
                break;

                default :
                    throw new Error('Invalid record length');
                break;
            }


            //validate flow type
            var flowStruct: CBIStructs.FlowStruct = CBIStructs.MAPPINGS[flowType];
            if( flowStruct === undefined)
                throw new Error('Unknown flow type '+ flowType);


            //check if record type exists
            var recStruct: CBIStructs.RecordStruct = flowStruct[this.code];
            if( recStruct === undefined )
                throw new Error('Unknown record type '+ this.code);


            //create record
            this._fields = recStruct.map( (struct: CBIStructs.FieldStruct) =>{

                var content: string = undefined;

                //reading from raw - get content
                if(recordType.length === Record.RAW_RECORD_LENGTH){

                    content = recordType.substring(struct[0]-1, struct[1]);
                }

                else if(struct[2] === 'tipo_record'){

                    content = this.code;
                }

                return new Field(
                    struct[0],  //from
                    struct[1],  //to
                    struct[2],  //name
                    content
                );
            });

            this._lazyFields = lazy(this._fields);
        }


        public getField(name: string){

            return this._lazyFields.find( (candidate: Field) => { return candidate.name === name} );
        }


        public appendField(field: Field){

            assert( field instanceof Field, 'Not a Field instance' );

            var f = this.getField(name);

            if(f){ throw new Error('There is already a field with name '+field.name); }

            this._fields.push(field);
        }

    }
}
