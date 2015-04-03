///<reference path="../typings/tsd.d.ts"/>

import assert = require('assert');
import CBIStructs = require('./record_mapping');
import s = require('underscore.string');
import lazy = require('lazy.js');
import fs = require('fs');

/**
*
*  Writer and parser for CBI txt files
*
*/


export module CBI{



    export class Flow {

        constructor(
            private header: Record,
            private disposals: Array <Disposals>,
            private footer: Record) {

        }

            public static readFile(
                filepath: string,
                flowtype:string = 'OUTPUT_RECORD_MAPPING' )

                : Flow {

                fs.readFile(filepath, (err,data)=>{

                    if(err){ throw err };



                });
        }
    }



    export class Disposal {

       private records: Array<Record>;


       //TODO può esserci solo un record con un dato codice all'interno di un disposal (distinta?)

       public getRecord(string: code): Record {

            assert(typeof code === 'string', 'Record type must be a string');

            return lazy(this.records).find(
                    (candidate: Record) => { return candidate.code === code} );
       }

       public appendRecord(record: Record){

            assert(record instanceof Record, 'This is not a Record');
            this.records.push(Record);
       }


    }


    /**
     *  Record class - maps to a single line in a cbi file
     */
    export class Record {

        private _fields : Array<Field>;
        get fields(): Array<Field>{ return this._fields; }

        //usata solo internamente per ottimizzare la chiamate a lazy.js
        private _lazyFields: LazyJS.ArrayLikeSequence<Field> ;

        private _code : string;
        get code(): string { return this._code;}

        private recordStruct: CBIStructs.RecordStruct;


        public static RAW_RECORD_LENGTH: number = 120;


        /**
         * Create a record istance.
         *
         * @param recordType - can be a two letter record type identifier OR a full raw record line
         * @param flowType -  the file type this record belongs to - used for validation
         */

        constructor(recordType: string, flowType: string) {

            var code: string;

            switch(recordType.length) {

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
            this.recordStruct  = flowStruct[this.code];
            if( this.recordStruct === undefined )
                throw new Error('Unknown record type '+ this.code);


            //create record
            this._fields = this.recordStruct.map( (struct: CBIStructs.FieldStruct)=> {

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

        /**
         * Gets a field by name. Two fields with the same name cannot exist in the same record
         *
         * @param name : the field name
         */

        public getField(name: string): string {

            return this._lazyFields.find(
                    (candidate: Field) => { return candidate.name === name} ).toString();
        }

        /**
         * Sets and validate a field
         * @param name : the field name
         * @param value : the field value
         */

        public setField(name: string, value : string): void {

            var field: Field = this._lazyFields.find(
                    (candidate: Field) => { return candidate.name === name} );

            if(!field) {

                throw new Error('This record cannot contain a field with name '+name);
            }

            field.content = value;
        }

        /**
         *  Renders a string representation of the record
         */
        public toString(): string{

            return this._fields.reduce(
                (out: string, field: Field)=> { return out+=field.toString() },
                ''
            );
        }

    }



    /**
     * This class represents a field in a single record
     */

    export class Field {

        get length(): number {
            return this.to - this.from + 1;
        }

        get name(): string { return this._name; }

        private _content: string;

        set content(content: string) {

             assert(content.length === this.length, 'Invalid content length for '+this._name);
             this._content = content;
        }

        get content() {

             return this._content;
        }

        constructor(

            private from : number,
            private to : number,
            private _name : string,
            content? : string) {

            assert(this.validatePosition(from),'Invalid from param');
            assert(this.validatePosition(to), 'Invalid to param');

            if(this.length <= 0){

                throw new Error('Invalid from/to params');
            }

            this._content = content ? content : s.repeat(' ', this.length);

            assert(this._content.length === this.length);
        }


        private validatePosition(val : number):Boolean{

            return (typeof val === 'number') && (val % 1 === 0) && ( val>0 );
        }


       public toString():string { return this.content; }
    }
}
