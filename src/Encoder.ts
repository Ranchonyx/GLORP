import {FlAGS, GLORP_MAGIC, ShapeNode, StringifiedShape, TAGS} from "./Util/Constants.js";
import {ByteBuffer} from "./Util/ByteBuffer.js";
import {encodeString} from "./Encoders/StringEncoder.js";
import {InvalidArgumentEncodeError, InvalidArgumentRangeError} from "./Util/Errors.js";
import {BufferedWriter} from "./Util/BufferedWriter";

function buf(len: number): ByteBuffer {
    return ByteBuffer.alloc(len);
}

export class BufferedEncoder {
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
                    if (isRecord(obj[key]))
                        keysArray.push(getNestedKeysAsArrayOfArrays(obj[key] as Record<string, unknown>));
                }

            return keysArray;
        }

        return getNestedKeysAsArrayOfArrays(input as Record<string, unknown>);
    }

    private encodeString(data: unknown) {

    }

    private encodeBoolean(data: unknown) {
        if (data)
            return Buffer.of(TAGS.TRU);

        return Buffer.of(TAGS.FLS);
    }

    private encodeAbsence(data: unknown) {
        return Buffer.of(TAGS.ABS);
    }

    private buf(len: number): ByteBuffer {
        return ByteBuffer.alloc(len);
    }

    private _sign(value: number | bigint): number {
        if (typeof value === "bigint")
            return value < 0n ? -1 : value > 0n ? 1 : 0;

        return Math.sign(value);
    }

    private encodeInteger(integer: number | bigint): Buffer {
        function encodePositiveInteger(positiveInteger: number | bigint) {
            if (typeof positiveInteger === "bigint") {
                const m = buf(9);
                m[0] = TAGS.UBI;
                m.writeBigUInt64BE(positiveInteger, 1);
                return m;
            }

            if (positiveInteger <= 0xff)
                return Buffer.from([TAGS.U8, positiveInteger]);

            if (positiveInteger <= 0xff_ff) {
                const m = buf(3);
                m[0] = TAGS.U16;
                m.writeUInt16BE(positiveInteger, 1);

                return m;
            }

            if (positiveInteger <= 0xff_ff_ff) {
                const m = buf(4);
                m[0] = TAGS.U24;
                m.writeUInt24BE(positiveInteger, 1);

                return m;
            }

            if (positiveInteger <= 0xff_ff_ff_ff) {
                const m = buf(5);
                m[0] = TAGS.U32;
                m.writeUInt32BE(positiveInteger, 1);
                return m;
            }

            if (positiveInteger <= 0xff_ff_ff_ff_ff_ff) {
                const m = buf(7);
                m[0] = TAGS.U48;
                m.writeUInt48BE(positiveInteger, 1);

                return m;
            }

            const m = buf(9);
            m[0] = TAGS.UBI;
            m.writeBigUInt64BE(BigInt(positiveInteger), 1);
            return m;
        }

        function encodeNegativeInteger(negativeInteger: number | bigint) {
            if (typeof negativeInteger === "bigint") {
                const m = buf(9);
                m[0] = TAGS.SBI;
                m.writeBigInt64BE(negativeInteger, 1);
                return m;
            }

            if (negativeInteger >= -0x80) {
                const m = buf(2);
                m[0] = TAGS.S8;
                m.writeInt8(negativeInteger, 1);
                return m;
            }

            if (negativeInteger >= -0x8000) {
                const m = buf(3);
                m[0] = TAGS.S16;
                m.writeInt16BE(negativeInteger, 1);
                return m;
            }

            if (negativeInteger >= -0x800000) {
                const m = buf(4);
                m[0] = TAGS.S24;
                m.writeInt24BE(negativeInteger, 1);
                return m;
            }

            if (negativeInteger >= -0x80000000) {
                const m = buf(5);
                m[0] = TAGS.S32;
                m.writeInt32BE(negativeInteger, 1);
                return m;
            }

            if (negativeInteger >= -0x800000000000) {
                const m = buf(7);
                m[0] = TAGS.S48;
                m.writeInt48BE(negativeInteger, 1);
                return m;
            }

            const m = buf(9);
            m[0] = TAGS.SBI;
            m.writeBigInt64BE(BigInt(negativeInteger), 1);
            return m;
        }

        const sign = this._sign(integer);
        if (sign === 1)
            return encodePositiveInteger(integer);

        if (sign === -1)
            return encodeNegativeInteger(integer);

        throw new InvalidArgumentEncodeError(integer)
    }

    private encodeFloat(float: number): Buffer {
        //Wenn fround(64bit number) === 32 number, dann passt x in 32bits IEEE-754
        if (Math.fround(float) === float) {
            const buf = ByteBuffer.alloc(5);
            buf[0] = TAGS.F32;
            buf.writeFloatBE(float, 1);
            return buf;
        }

        const buf = ByteBuffer.alloc(9);
        buf[0] = TAGS.F64;
        buf.writeDoubleBE(float, 1);
        return buf;
    }

    private encodeNumber(x: number | bigint): Buffer {
        if (typeof x === "bigint")
            return this.encodeInteger(x);

        //NaN behandeln
        if (Number.isNaN(x))
            return Buffer.from([TAGS.NN]);

        //Infinity
        if (x === Infinity)
            return Buffer.from([TAGS.PI]);

        //Negative infinity
        if (x === -Infinity)
            return Buffer.from([TAGS.NI]);

        //Muss Object.is nutzen weil in js 0 === -1 := true
        if (Object.is(x, -0))
            return Buffer.from([TAGS.NZ]);

        //Positive zero
        if (x === 0)
            return Buffer.from([TAGS.PZ]);

        //Wenn integral...
        if (Number.isInteger(x)) {

            //Wenn unsicher kabumm
            if (!Number.isSafeInteger(x))
                throw new InvalidArgumentRangeError(x, Number.MAX_SAFE_INTEGER);

            //Integer kodieren
            return this.encodeInteger(x);
        }

        //Ab hier ist basically alles geprüft, ergo wird x ab hier nen float sein
        return this.encodeFloat(x);
    }

    private isPrimitive(data: unknown): boolean {
        switch (typeof data) {
            case "bigint":
            case "boolean":
            case "string":
            case "number":
            case "undefined":
                return true;
        }

        return data === null;
    }

    private encodePrimitive(data: unknown) {
        if (typeof data === "number" || typeof data === "bigint")
            return this.encodeNumber(data);
        if (typeof data === "string")
            return this.encodeString(data);
        if (typeof data === "boolean")
            return this.encodeBoolean(data);
        if (typeof data === "undefined" || data === null)
            return this.encodeAbsence(data);

        throw new InvalidArgumentEncodeError(data);
    }

    private encodeDate(data: Date): Buffer {
        const b = ByteBuffer.alloc(8);
        b[0] = TAGS.DATE;
        b.writeInt56BE(data.valueOf(), 1)

        return b;
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

        throw new InvalidArgumentEncodeError(array);
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

        throw new InvalidArgumentRangeError(data, 0xff_ff_ff_ff);
    }

    private encodeUnknown(data: unknown, createStringReferences: boolean = true) {
        //Check if we need to encode a primitive first
        if (typeof data === "string" && createStringReferences) {
            //Check if string is in dict and then write ref
            const stringIndex = this.stringIndices.get(data);
            if (stringIndex !== undefined)
                return this.encodeStringReference(stringIndex);
        }

        if (this.isPrimitive(data))
            return this.encodePrimitive(data);

        if (Object.getPrototypeOf(data) === Date.prototype)
            return this.encodeDate(data as Date);

        //If we're dealing with an array
        if (Array.isArray(data))
            return this.encodeArray(data)

        const proto = Object.getPrototypeOf(data);
        if (typeof data === "object" && (proto === null || Object.getPrototypeOf(proto) === null)) {
            const shape: StringifiedShape = JSON.stringify(this.dehydrateToShape(data));
            const shapeIndex = this.shapeIndices.get(shape);

            if (shapeIndex !== undefined)
                return this.encodeShapeReference(data as Record<string, unknown>, shapeIndex);

            return this.encodeRecord(data as Record<string, unknown>);
        }

        throw new InvalidArgumentEncodeError(data);
    }

    private encodeShapeReference(data: Record<string, unknown>, index: number): Buffer {
        const encoded: Buffer[] = [];

        const values = Object.values(data);
        for (const value of values) {
            encoded.push(this.encodeUnknown(value));
        }

        return Buffer.concat([
            Buffer.of(TAGS.SP_SHAPE_REF),
            this.encodeNumber(index),
            this.encodeNumber(values.length),
            ...encoded
        ]);
    }

    private encodeStringReference(index: number): Buffer {
        return Buffer.concat([
            Buffer.of(TAGS.SP_STRING_REF),
            this.encodeNumber(index)
        ]);
    }

    public constructor(private writer: BufferedWriter) {
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
            if (value === null || (this.isPrimitive(value) && typeof value !== "string") || value instanceof Date)
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

        this.writer.writeByte(GLORP_MAGIC);
        this.writer.writeByte(flagsByte);
        if (this.shapes.length > 0) {
            this.encodeArray(this.shapes);
            flagsByte |= FlAGS.TAB_SHAPES;
        }

        if (this.strings.length > 0) {
            this.encodeArray(this.strings, false);
            flagsByte |= FlAGS.TAB_STRINGS;
        }

        this.encodeUnknown(data);
        return this.writer.finish();
    }
}