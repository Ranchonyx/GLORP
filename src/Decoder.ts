import {ByteBufferStream} from "./ByteBuffer";
import {FlAGS, GLORP_MAGIC, ShapeNode, StringifiedShape, TAGS} from "./Constants";
import {decodeNumber} from "./Decoders/NumberDecoder";
import {decodeString} from "./Decoders/StringDecoder";
import {decodeBoolean} from "./Decoders/BooleanDecoder";
import {decodeAbsence} from "./Decoders/AbsenceDecoder";
import {decodeDate} from "./Decoders/DateDecoder";

export class Decoder {
    private shapes: ShapeNode[] = [];
    private strings: string[] = [];

    public constructor(private stream: ByteBufferStream) {
    }

    private rehydrateShape(shape: ShapeNode, values: unknown): unknown {
        let shapeIndex = 0;
        let valueIndex = 0;

        const result: Record<string, unknown> = {};
        //Test here first, since at the top level, every shape is an array at least once
        if (!Array.isArray(shape))
            throw new Error("Invalid shape.");

        while (shapeIndex < shape.length) {
            const key = shape[shapeIndex];

            if (typeof key !== "string")
                throw new Error("Invalid key.");

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
                throw new Error("Unable to decode array.");
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
                throw new Error("Unable to decode record.");
        }

        const record: Record<string, unknown> = {};

        for (let i = 0; i < entryCount; i++) {
            const key = this.decodeString();
            const value = this.decodeUnknown();

            record[key] = value;
        }

        return record;
    }

    private decodeStringReference() {
        this.stream.skip(1)
        const {value: index, bytesRead} = decodeNumber(this.stream.peekSlice());
        this.stream.skip(bytesRead);

        return this.strings[Number(index)];
    }

    private decodeShapeReference() {
        this.stream.skip(1);

        const indexResult = decodeNumber(this.stream.peekSlice());
        this.stream.skip(indexResult.bytesRead);

        const countResult = decodeNumber(this.stream.peekSlice());
        this.stream.skip(countResult.bytesRead);

        const shape = this.shapes[Number(indexResult.value)];
        if (!shape)
            throw new Error(`No such shape ${indexResult.value}`);

        const values: unknown[] = [];

        for (let i = 0; i < Number(countResult.value); i++) {
            values.push(this.decodeUnknown());
        }

        this.rehydrateShape(shape, values);
    }

    private decodeDate() {
        const slice = this.stream.peekSlice();
        const {value, bytesRead} = decodeDate(slice);

        this.stream.skip(bytesRead);

        return value;
    }

    private decodeUnknown(): unknown {
        const tag = this.stream.peekByte() as TAGS;

        console.log(TAGS[tag]);

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

        if (tag === TAGS.SP_SHAPE_REF) {
            return this.decodeShapeReference();
        }

        if (tag === TAGS.SP_STRING_REF) {
            return this.decodeStringReference();
        }

        throw new Error(`Unrecognized tag: ${tag} / ${TAGS[tag]}`);
    }

    public Decode<T = unknown>(): T {
        const elements: unknown[] = [];

        //Read header
        if (this.stream.peekByte() !== GLORP_MAGIC)
            throw new Error("No magic number.");
        this.stream.skip(1);

        /*
            Buffer.of(GLORP_MAGIC),
            Buffer.of(flagsByte),
            Buffer.concat(tables),
            payload
        */

        const flags = this.stream.peekByte();
        this.stream.skip(1);

        const hasShapeTable = (flags & FlAGS.TAB_SHAPES) !== 0;
        const hasStringTable = (flags & FlAGS.TAB_STRINGS) !== 0;

        if (hasShapeTable || hasStringTable)
            if (!(
                this.stream.peekByte() === TAGS.ARR8 ||
                this.stream.peekByte() === TAGS.ARR16 ||
                this.stream.peekByte() === TAGS.ARR24 ||
                this.stream.peekByte() === TAGS.ARR32
            ))
                throw new Error("Expected a table.");

        if (hasShapeTable) {
            //Parse shapes
            const decodedShapeArray = this.decodeArray() as StringifiedShape[];
            for (const decodedShape of decodedShapeArray) {
                this.shapes.push(JSON.parse(decodedShape));
            }
        }

        if (hasStringTable) {
            //Parse shapes
            const decodedStringArray = this.decodeArray() as string[];
            for (const decodedString of decodedStringArray) {
                this.strings.push(decodedString);
            }
        }

        //Start parsing everything else
        while (!this.stream.eof) {
            const value = this.decodeUnknown();
            elements.push(value);
        }

        if (elements.length === 0)
            throw new Error("Unable to decode.")

        return (elements.length > 1 ? elements : elements[0]) as T;
    }
}