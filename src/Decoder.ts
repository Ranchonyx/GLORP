import {ByteBufferStream} from "./ByteBuffer";
import {TAGS} from "./Constants";
import {decodeNumber} from "./Decoders/NumberDecoder";
import {decodeString} from "./Decoders/StringDecoder";
import {decodeBoolean} from "./Decoders/BooleanDecoder";
import {decodeAbsence} from "./Decoders/AbsenceDecoder";
import {decodeDate} from "./Decoders/DateDecoder";

export class Decoder {
    public constructor(private stream: ByteBufferStream) {
    }

    private decodeNumber() {
        const slice = this.stream.peekSlice();
        const {value, bytesRead} = decodeNumber(slice);

        this.stream.skip(bytesRead);

        return value;
    }

    private decodeString() {
        const slice = this.stream.peekSlice();
        const {value, bytesRead} = decodeString(slice);

        this.stream.skip(bytesRead);

        return value;
    }

    private decodeBoolean() {
        const slice = this.stream.peekSlice();
        const {value, bytesRead} = decodeBoolean(slice);

        this.stream.skip(bytesRead);

        return value;
    }

    private decodeAbsence() {
        const slice = this.stream.peekSlice();
        const {value, bytesRead} = decodeAbsence(slice);

        this.stream.skip(bytesRead);

        return value;
    }

    private decodeArray() {
        const tag = this.stream.peekByte() as TAGS;
        const slice = this.stream.peekSlice();

        let elementCount: number;

        switch (tag) {
            case TAGS.ARR8:
                elementCount = slice.readUInt8(1);
                this.stream.skip(2);
                break;

            case TAGS.ARR16:
                elementCount = slice.readUInt16BE(1);
                this.stream.skip(3);
                break;

            case TAGS.ARR24:
                elementCount = slice.readUInt24BE(1);
                this.stream.skip(4);
                break;

            case TAGS.ARR32:
                elementCount = slice.readUInt32BE(1);
                this.stream.skip(5);
                break;

            default:
                throw new Error("Unable to decode array.");
        }

        const values: unknown[] = [];

        for (let i = 0; i < elementCount; i++) {
            values.push(this._DecodeUnknown());
        }

        return values;
    }

    private decodeRecord() {
        const tag = this.stream.peekByte() as TAGS;

        let entryCount: number;

        switch (tag) {
            case TAGS.REC8: {
                const slice = this.stream.peekSlice();
                entryCount = slice.readUInt8(1);
                this.stream.skip(2);
                break;
            }

            case TAGS.REC16: {
                const slice = this.stream.peekSlice();
                entryCount = slice.readUInt16BE(1);
                this.stream.skip(3);
                break;
            }

            case TAGS.REC24: {
                const slice = this.stream.peekSlice();
                entryCount = slice.readUInt24BE(1);
                this.stream.skip(4);
                break;
            }

            case TAGS.REC32: {
                const slice = this.stream.peekSlice();
                entryCount = slice.readUInt32BE(1);
                this.stream.skip(5);
                break;
            }

            default:
                throw new Error("Unable to decode record.");
        }

        const record: Record<string, unknown> = {};

        for (let i = 0; i < entryCount; i++) {
            const key = this.decodeString();
            const value = this._DecodeUnknown();

            record[key] = value;
        }

        return record;
    }

    private decodeDate() {
        const slice = this.stream.peekSlice();
        const {value, bytesRead} = decodeDate(slice);

        this.stream.skip(bytesRead);

        return value;
    }

    private _DecodeUnknown(): unknown {
        const tag = this.stream.peekByte() as TAGS;
        console.log(`TAG: ${TAGS[tag]}`);

        if (tag >= TAGS.PI && tag <= TAGS.F64) {
            return this.decodeNumber();
        }

        if (tag > TAGS.F64 && tag <= TAGS.STU32) {
            return this.decodeString();
        }

        if (tag > TAGS.STU32 && tag <= TAGS.FLS) {
            return this.decodeBoolean();
        }

        if (tag > TAGS.FLS && tag <= TAGS.ABS) {
            return this.decodeAbsence();
        }

        if (tag > TAGS.ABS && tag <= TAGS.ARR32) {
            return this.decodeArray();
        }

        if (tag > TAGS.ARR32 && tag <= TAGS.REC32) {
            return this.decodeRecord();
        }

        if (tag > TAGS.REC32 && tag <= TAGS.DATE) {
            return this.decodeDate();
        }

        throw new Error(`Unrecognized tag: ${tag}`);
    }

    public Decode(): unknown[] {
        const elements: unknown[] = [];

        while (!this.stream.eof) {
            const value = this._DecodeUnknown();
            elements.push(value);
        }

        return elements;
    }
}