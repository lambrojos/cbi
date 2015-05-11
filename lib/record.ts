///<reference path="../typings/tsd.d.ts"/>
import assert = require('assert');
import CBIStructs = require('./record_mapping');
import s = require('underscore.string');
import lazy = require('lazy.js');
import fs = require('fs');
import bl = require('byline');

/**
*
*  Writer and parser for CBI txt files
*
*/
export module CBI{

    /*
     * Flow class - maps to a whole CBI file
     *
     */
    export class Flow {

        private _header: Record;
        private _disposals: Array<Disposal>;
        private _footer: Record;
        public flowtype: string;

        /**
         * It's possibile to create a new empty instance and then fill in the fields,
         * or to specify a record array, usually from a parsed file
         *
         * @param records array of records, including header and footer, or null
         * @param flowtype the flow type
         *
         **/

        constructor( records: Array<Record>, flowtype: string, firstRecordId: string = '14'){

            this.flowtype = flowtype;

            if(records === null){ return; }

            if(records.length < 3){

                throw new Error('Insufficent record length');
            }

            this._header = records.shift();
            this._footer = records.pop();

            this._disposals = records.reduce(

                (dps: Array<Disposal>, rec: Record)=>{

                    var currentDsp = dps[dps.length-1];

                    //TODO devo validare il fatto che il primo record che becco
                    //ha il firstRecordId

                    // New disp starting
                    if(rec.getField('tipo_record') === firstRecordId ){

                        currentDsp = new Disposal();
                        dps.push(currentDsp);
                    }

                    //questo si verifica se il primo record non è un tipo_record
                    assert(currentDsp instanceof Disposal, 'Wrong file format - first record did not have correct tipo_record');

                    currentDsp.appendRecord(rec);

                    return dps;
                },

                []
            )
        }

        /**
         *  Convenience static method to create an instance from a file
         *
         *  @param filepath path to a cbi file
         *  @param flowtype the flow type
         *  @param onready nodeback style completion callback
         *
         * */

        public static fromFile(

            filepath: string,
            flowtype: string,
            onready: (err: Error, flow: Flow)=> void
            )
            : void {


            var stream: bl.LineStream = bl.createStream(

                fs.createReadStream(filepath)
            );

            var records: Array<Record> = [];

            stream.on('readable', function() {

                var line: Buffer;

                while (null !== (line = stream.read())) {

                    records.push( new Record(line.toString(), flowtype));
                }
            });

            stream.on('error', (err: Error)=> {onready( err, null); } );
            stream.on('end', ()=>{ onready(null, new Flow(records, flowtype)) });
        }


        public toFile(filepath: string, done: (err: Error)=>void){

            var writeStream = fs.createWriteStream(filepath);
            writeStream.write(this._header.toString()+'\r\n');

            this._disposals.forEach((disposal : Disposal)=>{

                writeStream.write(disposal.toString());
            });

            writeStream.write(this._footer.toString()+'\r\n');
            writeStream.end();

            writeStream.on('error', function(err: Error){
                return done(err);
            });
            writeStream.on('finish', function(){
                return done(null);
            });
        };

    }

    export class Disposal {

       private records: Array<Record>;

       constructor(){

           this.records = [];
       }

       //TODO può esserci solo un record con un dato codice all'interno di un disposal (distinta?)
       public getRecord(code: string): Record {

            assert(typeof code === 'string', 'Record type must be a string');

            return lazy(this.records).find(
                    (candidate: Record) => { return candidate.code === code} );
       }

       public appendRecord(record: Record){

            assert(record instanceof Record, 'This is not a Record');
            this.records.push(record);
       }

       public toString(): string{

            return this.records.reduce(
                (out: string, record: Record)=> { return out+=record.toString()+'\r\n' },
                ''
            );
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

            if(this.code === '51')
                console.log('aaaa',flowStruct[this.code]);

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
