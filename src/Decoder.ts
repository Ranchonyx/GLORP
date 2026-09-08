import {GLORP_MAGIC, ShapeNode, TAGS} from "./Util/Constants.js";
import {decodeNumber} from "./Decoders/NumberDecoder.js";
import {decodeString} from "./Decoders/StringDecoder.js";
import {decodeBoolean} from "./Decoders/BooleanDecoder.js";
import {decodeAbsence} from "./Decoders/AbsenceDecoder.js";
import {decodeDate} from "./Decoders/DateDecoder.js";
import {ByteBufferStream} from "./Util/ByteBufferStream.js";
import {InvalidBytecodeDecodeError} from "./Util/Errors.js";

export class Decoder {
    private stringData = new Map<number, string>();
    private shapeData = new Map<number, ShapeNode>

    public constructor(private stream: ByteBufferStream) {
    }

    private rehydrateShape(shape: ShapeNode, values: unknown): unknown {
        let shapeIndex = 0;
        let valueIndex = 0;

        const result: Record<string, unknown> = {};
        //Test here first, since at the top level, every shape is an array at least once
        if (!Array.isArray(shape))
            throw new Error(`While rehydrating shape ${JSON.stringify(shape)}: Shape is invalid - not an array.`);

        while (shapeIndex < shape.length) {
            const key = shape[shapeIndex];

            if (typeof key !== "string")
                throw new Error(`While rehydrating shape ${JSON.stringify(shape)}: Shape key ${key} is invalid - not a string.`);

            const maybeNextShape = shape[shapeIndex + 1];

            let value: unknown;
            if (Array.isArray(values))
                value = values[valueIndex];
            else
                value = (values as Record<string, unknown>)[key];

            //If our next shape is an array, it must be a nested record's keys
            if (Array.isArray(maybeNextShape)) {
                result[key] = this.rehydrateShape(maybeNextShape, value);
                shapeIndex += 2;
            } else {
                //If it isn't, it's a property, so apply the value to it
                result[key] = value;
                shapeIndex++;
            }

            valueIndex++;
        }

        return result;
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
                throw new InvalidBytecodeDecodeError("array", slice);
        }

        const values: unknown[] = [];

        for (let i = 0; i < elementCount; i++) {
            values.push(this.decodeUnknown());
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
                throw new InvalidBytecodeDecodeError("record", this.stream.peekSlice());
        }

        const record: Record<string, unknown> = {};

        for (let i = 0; i < entryCount; i++) {
            const key = this.decodeString();
            record[key] = this.decodeUnknown();
        }

        return record;
    }

    private decodeStringDefinition() {
        this.stream.skip(1);

        const stringDataIndex = this.decodeNumber();
        const stringDataValue = this.decodeString();

        this.stringData.set(Number(stringDataIndex), stringDataValue);

        return stringDataValue;
    }

    private decodeStringReference() {
        this.stream.skip(1)

        const {value: index, bytesRead} = decodeNumber(this.stream.peekSlice());
        this.stream.skip(bytesRead);

        const data = this.stringData.get(Number(index));
        if (!data)
            throw new Error(`While decoding string at index ${index}: No corresponding string found.`);

        return data;
    }

    private decodeShapeDefinition() {
        this.stream.skip(1);

        const shapeDataIndex = this.decodeNumber();
        const recordShapeJSON = this.decodeString();
        const valuesLength = this.decodeNumber();

        const values: unknown[] = [];

        //VALUES
        for (let i = 0; i < Number(valuesLength); i++) {
            values.push(this.decodeUnknown());
        }

        const shape = JSON.parse(recordShapeJSON);
        this.shapeData.set(Number(shapeDataIndex), shape);
        return this.rehydrateShape(shape, values);
    }

    private decodeShapeReference() {
        this.stream.skip(1);

        const indexResult = decodeNumber(this.stream.peekSlice());
        this.stream.skip(indexResult.bytesRead);

        const countResult = decodeNumber(this.stream.peekSlice());
        this.stream.skip(countResult.bytesRead);

        const shape = this.shapeData.get(Number(indexResult.value));
        if (!shape)
            throw new Error(`While decoding shape at index ${indexResult.value}: No corresponding shape found.`);

        const values: unknown[] = [];

        for (let i = 0; i < Number(countResult.value); i++) {
            values.push(this.decodeUnknown());
        }

        return this.rehydrateShape(shape, values);
    }

    private decodeDate() {
        const slice = this.stream.peekSlice();
        const {value, bytesRead} = decodeDate(slice);

        this.stream.skip(bytesRead);

        return value;
    }

    private decodeUnknown(): unknown {
        const tag = this.stream.peekByte() as TAGS;

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

        if (tag === TAGS.SP_SHAPE_DEF) {
            return this.decodeShapeDefinition();
        }

        if (tag === TAGS.SP_SHAPE_REF) {
            return this.decodeShapeReference();
        }

        if (tag === TAGS.SP_STRING_DEF) {
            return this.decodeStringDefinition();
        }

        if (tag === TAGS.SP_STRING_REF) {
            return this.decodeStringReference();
        }

        throw new InvalidBytecodeDecodeError("unknown", this.stream.peekSlice())
    }

    public Decode<T = unknown>(): T {
        const elements: unknown[] = [];

        //Read header
        if (this.stream.peekByte() !== GLORP_MAGIC)
            throw new Error("The input buffer is not a GLORP stream.");
        this.stream.skip(1);

        const flags = this.stream.peekByte();
        this.stream.skip(1);

        //Start parsing everything else
        while (!this.stream.eof) {
            const value = this.decodeUnknown();
            elements.push(value);
        }

        if (elements.length === 0)
            throw new Error("Decoded amount of elements may not be zero!");

        return (elements.length > 1 ? elements : elements[0]) as T;
    }
}