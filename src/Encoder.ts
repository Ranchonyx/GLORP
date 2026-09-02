import {encodePrimitive, isPrimitive} from "./Encoders/PrimitiveEncoder";
import {encodeDate} from "./Encoders/DateEncoder";
import {FlAGS, GLORP_MAGIC, ShapeNode, StringifiedShape, TAGS} from "./Constants";
import {ByteBuffer} from "./ByteBuffer";
import {encodeString} from "./Encoders/StringEncoder";
import {encodeNumber} from "./Encoders/NumberEncoder";

function buf(len: number): ByteBuffer {
    return ByteBuffer.alloc(len);
}

export class Encoder {
    private shapes: StringifiedShape[] = [];
    private shapeIndices = new Map<StringifiedShape, number>();

    private strings: string[] = [];
    private stringIndices = new Map<string, number>();

    private dehydrateToShape(input: unknown): ShapeNode {
        const isRecord = (value: unknown): value is Record<string, unknown> =>
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            !(value instanceof Date);

        const getNestedKeysAsArrayOfArrays = (obj: Record<string, unknown>): ShapeNode => {
            const keysArray: ShapeNode[] = [];

            if (typeof obj === "object")
                for (let key in obj) {
                    keysArray.push(key);

                    if (obj[key] === null)
                        throw new Error();

                    if (isRecord(obj[key]))
                        keysArray.push(getNestedKeysAsArrayOfArrays(obj[key] as Record<string, unknown>));
                }

            return keysArray;
        }

        return getNestedKeysAsArrayOfArrays(input as Record<string, unknown>);
    }

    public constructor() {
    }

    private encodeArray(array: unknown[], createStringReferences: boolean = true) {
        const elements: Buffer[] = [];

        for (const element of array) {
            elements.push(this.encodeUnknown(element, createStringReferences));
        }

        const elementsBuffer = Buffer.concat(elements);

        const count = array.length;
        const contentLength = elementsBuffer.byteLength;

        if (count <= 0xff) {
            const m = buf(contentLength + 2);

            m[0] = TAGS.ARR8;
            m[1] = count;
            m.set(elementsBuffer, 2);

            return m;
        }

        if (count <= 0xff_ff) {
            const m = buf(contentLength + 3);

            m[0] = TAGS.ARR16;
            m.writeUInt16BE(count, 1);
            m.set(elementsBuffer, 3);

            return m;
        }

        if (count <= 0xff_ff_ff) {
            const m = buf(contentLength + 4);

            m[0] = TAGS.ARR24;
            m.writeUInt24BE(count, 1);
            m.set(elementsBuffer, 4);

            return m;
        }

        if (count <= 0xff_ff_ff_ff) {
            const m = buf(contentLength + 5);

            m[0] = TAGS.ARR32;
            m.writeUInt32BE(count, 1);
            m.set(elementsBuffer, 5);

            return m;
        }

        throw new Error("Unable to encode array");
    }

    private encodeRecord(data: Record<string, unknown>): Buffer {
        const entries = Object.entries(data);
        const encoded: Buffer[] = [];

        for (const [key, value] of entries) {
            encoded.push(encodeString(key));
            encoded.push(this.encodeUnknown(value));
        }

        const content = Buffer.concat(encoded);
        const len = entries.length;

        if (len <= 0xff) {
            return Buffer.concat([
                Buffer.of(TAGS.REC8, len),
                content
            ]);
        }

        if (len <= 0xff_ff) {
            const header = ByteBuffer.alloc(3);

            header[0] = TAGS.REC16;
            header.writeUInt16BE(len, 1);

            return Buffer.concat([header, content]);
        }

        if (len <= 0xff_ff_ff) {
            const header = ByteBuffer.alloc(4);

            header[0] = TAGS.REC24;
            header.writeUInt24BE(len, 1);

            return Buffer.concat([header, content]);
        }

        if (len <= 0xff_ff_ff_ff) {
            const header = ByteBuffer.alloc(5);

            header[0] = TAGS.REC32;
            header.writeUInt32BE(len, 1);

            return Buffer.concat([header, content]);
        }

        throw new Error("Record too large");
    }

    private encodeUnknown(data: unknown, createStringReferences: boolean = true) {
        //Check if we need to encode a primitive first
        if (typeof data === "string" && createStringReferences) {
            //Check if string is in dict and then write ref
            const stringIndex = this.stringIndices.get(data);
            if (stringIndex !== undefined)
                return this.encodeStringReference(stringIndex);
        }

        if (isPrimitive(data))
            return encodePrimitive(data);

        if (Object.getPrototypeOf(data) === Date.prototype)
            return encodeDate(data as Date);

        //If we're dealing with an array
        if (Array.isArray(data))
            return this.encodeArray(data)

        if (typeof data === "object") {
            const shape: StringifiedShape = JSON.stringify(this.dehydrateToShape(data));
            const shapeIndex = this.shapeIndices.get(shape);

            if (shapeIndex !== undefined)
                return this.encodeShapeReference(data as Record<string, unknown>, shapeIndex);

            return this.encodeRecord(data as Record<string, unknown>);
        }

        throw new Error("Unable to encode");
    }

    private encodeShapeReference(data: Record<string, unknown>, index: number): Buffer {
        const encoded: Buffer[] = [];

        const values = Object.values(data);
        for (const value of values) {
            encoded.push(this.encodeUnknown(value));
        }

        return Buffer.concat([
            Buffer.of(TAGS.SP_SHAPE_REF),
            encodeNumber(index),
            encodeNumber(values.length),
            ...encoded
        ]);
    }

    private encodeStringReference(index: number): Buffer {
        return Buffer.concat([
            Buffer.of(TAGS.SP_STRING_REF),
            encodeNumber(index)
        ]);
    }

    public Encode(data: unknown): Buffer {
        this.shapes = [];
        this.shapeIndices.clear();

        this.strings = [];
        this.stringIndices.clear();

        const shapeCounts = new Map<StringifiedShape, number>();
        const stringCounts = new Map<string, number>();

        const scan = (value: unknown) => {

            //nur interesse an arrays oder records deshalb yeet
            //auch interesse an strings seit Neustem
            if (value === null || (isPrimitive(value) && typeof value !== "string") || value instanceof Date)
                return;

            if (Array.isArray(value)) {
                value.forEach(v => scan(v));
                return;
            }

            if (typeof value === "string") {
                stringCounts.set(value, (stringCounts.get(value) || 0) + 1);
                return;
            }

            if (typeof value === "object") {
                const shape: StringifiedShape = JSON.stringify(this.dehydrateToShape(value));
                shapeCounts.set(shape, (shapeCounts.get(shape) || 0) + 1);

                Object.values(value).forEach(v => scan(v));
            }
        };

        //erster pass für analyse
        //zählt shapes und strings
        scan(data);

        for (const [shape, count] of shapeCounts) {
            if (count < 2)
                continue;

            this.shapeIndices.set(shape, this.shapes.length);
            this.shapes.push(shape);
        }

        for (const [string, count] of stringCounts) {
            if (count < 2)
                continue;

            this.stringIndices.set(string, this.strings.length);
            this.strings.push(string);
        }

        let flagsByte = 0x00;
        const tables: Buffer[] = [];
        if (this.shapes.length > 0) {
            tables.push(this.encodeArray(this.shapes));
            flagsByte |= FlAGS.TAB_SHAPES;
        }

        if (this.strings.length > 0) {
            tables.push(this.encodeArray(this.strings, false));
            flagsByte |= FlAGS.TAB_STRINGS;
        }

        const payload = this.encodeUnknown(data);

        return Buffer.concat([
            Buffer.of(GLORP_MAGIC),
            Buffer.of(flagsByte),
            Buffer.concat(tables),
            payload
        ]);
    }
}