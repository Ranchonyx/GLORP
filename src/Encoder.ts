import {FlAGS, GLORP_MAGIC, ShapeNode, StringEntry, StringifiedShape, StringState, TAGS} from "./Util/Constants.js";
import {InvalidArgumentEncodeError, InvalidArgumentRangeError} from "./Util/Errors.js";
import {BufferedWriter} from "./Util/BufferedWriter";

export class BufferedEncoder {
    private shapes: StringifiedShape[] = [];
    private shapeIndices = new Map<StringifiedShape, number>();

    private stringData = new Map<string, StringEntry>();

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

    private encodeUTF8String(utf8String: string, len: number): void {
        if (len <= 0xff) {
            this.writer.writeByte(TAGS.STU8);
            this.writer.writeUInt8(len);
            this.writer.writeBuffer(Buffer.from(utf8String, "utf8"));
            return;
        }

        if (len <= 0xff_ff) {
            this.writer.writeByte(TAGS.STU16);
            this.writer.writeUInt16BE(len);
            this.writer.writeBuffer(Buffer.from(utf8String, "utf8"));
            return;

        }

        if (len <= 0xff_ff_ff) {
            this.writer.writeByte(TAGS.STU24);
            this.writer.writeUInt24BE(len);
            this.writer.writeBuffer(Buffer.from(utf8String, "utf8"));
            return;
        }

        if (len <= 0xff_ff_ff_ff) {
            this.writer.writeByte(TAGS.STU32);
            this.writer.writeUInt32BE(len);
            this.writer.writeBuffer(Buffer.from(utf8String, "utf8"));
            return;
        }

        throw new InvalidArgumentRangeError(utf8String, 0xff_ff_ff_ff);
    }

    private encodeASCIIString(asciiString: string, len: number): void {
        if (len <= 0xff) {
            this.writer.writeByte(TAGS.STA8);
            this.writer.writeUInt8(len);
            this.writer.writeBuffer(Buffer.from(asciiString, "ascii"));
            return;
        }

        if (len <= 0xff_ff) {
            this.writer.writeByte(TAGS.STA16);
            this.writer.writeUInt16BE(len);
            this.writer.writeBuffer(Buffer.from(asciiString, "ascii"));
            return;
        }

        if (len <= 0xff_ff_ff) {
            this.writer.writeByte(TAGS.STA24);
            this.writer.writeUInt24BE(len);
            this.writer.writeBuffer(Buffer.from(asciiString, "ascii"));
            return;
        }

        if (len <= 0xff_ff_ff_ff) {
            this.writer.writeByte(TAGS.STA32);
            this.writer.writeUInt32BE(len);
            this.writer.writeBuffer(Buffer.from(asciiString, "ascii"));
            return;
        }

        throw new InvalidArgumentRangeError(asciiString, 0xff_ff_ff_ff);
    }

    private encodeString(x: string): void {
        const byteLength = Buffer.byteLength(x);

        if (x.length === byteLength)
            return this.encodeASCIIString(x, byteLength);

        return this.encodeUTF8String(x, byteLength);
    }

    private encodeBoolean(data: unknown): void {
        if (data === true) {
            this.writer.writeByte(TAGS.TRU);
            return;
        }

        this.writer.writeByte(TAGS.FLS);
    }

    private encodeAbsence(_: unknown): void {
        this.writer.writeByte(TAGS.ABS);
    }

    private _sign(value: number | bigint): number {
        if (typeof value === "bigint")
            return value < 0n ? -1 : value > 0n ? 1 : 0;

        return Math.sign(value);
    }

    private encodeInteger(integer: number | bigint): void {
        const encodePositiveInteger = (positiveInteger: number | bigint) => {
            if (typeof positiveInteger === "bigint") {
                this.writer.writeByte(TAGS.UBI);
                this.writer.writeBigUInt64BE(positiveInteger);
                return;
            }

            if (positiveInteger <= 0xff) {
                this.writer.writeByte(TAGS.U8);
                this.writer.writeUInt8(positiveInteger);
                return;
            }

            if (positiveInteger <= 0xff_ff) {
                this.writer.writeByte(TAGS.U16);
                this.writer.writeUInt16BE(positiveInteger);
                return;
            }

            if (positiveInteger <= 0xff_ff_ff) {
                this.writer.writeByte(TAGS.U24);
                this.writer.writeUInt24BE(positiveInteger);
                return;

            }

            if (positiveInteger <= 0xff_ff_ff_ff) {
                this.writer.writeByte(TAGS.U32);
                this.writer.writeUInt32BE(positiveInteger);
                return;
            }

            if (positiveInteger <= 0xff_ff_ff_ff_ff_ff) {
                this.writer.writeByte(TAGS.U48);
                this.writer.writeUInt48BE(positiveInteger);
                return;
            }

            this.writer.writeByte(TAGS.UBI);
            this.writer.writeBigUInt64BE(BigInt(positiveInteger));
        }

        const encodeNegativeInteger = (negativeInteger: number | bigint) => {
            if (typeof negativeInteger === "bigint") {
                this.writer.writeByte(TAGS.SBI);
                this.writer.writeBigInt64BE(negativeInteger);
                return;
            }

            if (negativeInteger >= -0x80) {
                this.writer.writeByte(TAGS.S8);
                this.writer.writeInt8(negativeInteger);
                return;
            }

            if (negativeInteger >= -0x8000) {
                this.writer.writeByte(TAGS.S16);
                this.writer.writeInt16BE(negativeInteger);
                return;
            }

            if (negativeInteger >= -0x800000) {
                this.writer.writeByte(TAGS.S24);
                this.writer.writeInt24BE(negativeInteger);
                return;
            }

            if (negativeInteger >= -0x80000000) {
                this.writer.writeByte(TAGS.S32);
                this.writer.writeInt32BE(negativeInteger);
                return;
            }

            if (negativeInteger >= -0x800000000000) {
                this.writer.writeByte(TAGS.S48);
                this.writer.writeInt48BE(negativeInteger);
                return;
            }

            this.writer.writeByte(TAGS.SBI);
            this.writer.writeBigInt64BE(BigInt(negativeInteger));
        }

        const sign = this._sign(integer);
        if (sign === 1 || sign === 0)
            return encodePositiveInteger(integer);

        if (sign === -1)
            return encodeNegativeInteger(integer);

        throw new InvalidArgumentEncodeError(integer)
    }

    private encodeFloat(float: number): void {
        //Wenn fround(64bit number) === 32 number, dann passt x in 32bits IEEE-754
        if (Math.fround(float) === float) {
            this.writer.writeByte(TAGS.F32);
            this.writer.writeFloatBE(float);
            return;
        }

        this.writer.writeByte(TAGS.F64);
        this.writer.writeDoubleBE(float);
        return;
    }

    private encodeNumber(x: number | bigint): void {
        if (typeof x === "bigint") {
            return this.encodeInteger(x);
        }
        //NaN behandeln
        if (Number.isNaN(x)) {
            this.writer.writeByte(TAGS.NN);
            return;
        }

        //Infinity
        if (x === Infinity) {
            this.writer.writeByte(TAGS.PI);
            return;
        }

        //Negative infinity
        if (x === -Infinity) {
            this.writer.writeByte(TAGS.NI);
            return;
        }

        //Muss Object.is nutzen weil in js 0 === -1 := true
        if (Object.is(x, -0)) {
            this.writer.writeByte(TAGS.NZ);
            return;
        }

        //Positive zero
        if (x === 0) {
            this.writer.writeByte(TAGS.PZ);
            return;
        }

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

    private encodeDate(data: Date): void {
        this.writer.writeByte(TAGS.DATE);
        this.writer.writeInt56BE(data.valueOf());
    }

    private encodeArray(array: unknown[], createStringReferences: boolean = true): void {
        const encodeMeta = (count: number) => {
            if (count <= 0xff) {
                this.writer.writeByte(TAGS.ARR8);
                this.writer.writeByte(count);
                return;
            }

            if (count <= 0xff_ff) {
                this.writer.writeByte(TAGS.ARR16);
                this.writer.writeUInt16BE(count);
                return;
            }

            if (count <= 0xff_ff_ff) {
                this.writer.writeByte(TAGS.ARR24);
                this.writer.writeUInt24BE(count);
                return;
            }

            if (count <= 0xff_ff_ff_ff) {
                this.writer.writeByte(TAGS.ARR32);
                this.writer.writeUInt32BE(count);
                return;
            }

            throw new InvalidArgumentRangeError(array, 0xff_ff_ff_ff);
        }

        encodeMeta(array.length);
        for (const element of array)
            this.encodeUnknown(element, createStringReferences);
    }

    private encodeRecord(data: Record<string, unknown>): void {
        const encodeMeta = (len: number) => {
            if (len <= 0xff) {
                this.writer.writeByte(TAGS.REC8);
                this.writer.writeByte(len);
                return;
            }

            if (len <= 0xff_ff) {
                this.writer.writeByte(TAGS.REC16);
                this.writer.writeUInt16BE(len);
                return;
            }

            if (len <= 0xff_ff_ff) {
                this.writer.writeByte(TAGS.REC24);
                this.writer.writeUInt24BE(len);
                return;
            }

            if (len <= 0xff_ff_ff_ff) {
                this.writer.writeByte(TAGS.REC32);
                this.writer.writeUInt32BE(len);
                return;
            }

            throw new InvalidArgumentRangeError(data, 0xff_ff_ff_ff);
        }

        const entries = Object.entries(data);
        encodeMeta(entries.length);

        for (const [key, value] of entries) {
            this.encodeString(key);
            this.encodeUnknown(value);
        }
    }

    private encodeUnknown(data: unknown, createStringReferences: boolean = true) {
        //Check if we need to encode a primitive first
        if (typeof data === "string" && createStringReferences) {

            const entry = this.stringData.get(data);

            //If we do not have a stringdata entry
            if (entry === undefined) {
                //Create it but encode it as a normal string
                this.stringData.set(data, {index: this.stringData.size, state: StringState.UNIQUE});
                return this.encodeString(data);
            } else {
                //If we do have an entry, check state
                if (entry.state === StringState.UNIQUE) {
                    //If it's unique until now, make it defined and encode a string definition
                    entry.state = StringState.DEFINED;
                    return this.encodeStringDefinition(data, entry);
                } else {
                    //If it's already defined, encode a reference
                    return this.encodeStringReference(entry);
                }
            }
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

    private encodeShapeReference(data: Record<string, unknown>, index: number): void {
        const values = Object.values(data);

        this.writer.writeByte(TAGS.SP_SHAPE_REF);
        this.encodeNumber(index);
        this.encodeNumber(values.length);
        for (const value of values) {
            this.encodeUnknown(value);
        }
    }

    private encodeStringDefinition(data: string, entry: StringEntry): void {
        this.writer.writeByte(TAGS.SP_STRING_DEF);
        this.encodeNumber(entry.index);
        this.encodeString(data);
    }

    private encodeStringReference(entry: StringEntry): void {
        this.writer.writeByte(TAGS.SP_STRING_REF);
        this.encodeNumber(entry.index);
    }

    public constructor(private writer: BufferedWriter) {
    }

    public Encode(data: unknown): Buffer {
        this.shapes = [];
        this.shapeIndices.clear();

        this.stringData.clear();

        const shapeCounts = new Map<StringifiedShape, number>();

        const scan = (value: unknown) => {
            if (value === null || value === undefined)
                return;

            const type = typeof value;
            switch (type) {
                case "object":
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++)
                            scan(value[i]);
                        return;
                    }

                    if (Object.getPrototypeOf(value) === Date.prototype)
                        return;

                    const shape: StringifiedShape = JSON.stringify(this.dehydrateToShape(value));
                    shapeCounts.set(shape, (shapeCounts.get(shape) || 0) + 1);

                    for (const key of Object.keys(value))
                        scan((value as Record<string, unknown>)[key]);
                    return;
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

        //Write magic
        this.writer.writeByte(GLORP_MAGIC);

        //Compute flags
        let flagsByte = 0x00;

        const hasShapes = this.shapes.length > 0;
        if (hasShapes)
            flagsByte |= FlAGS.TAB_SHAPES;

        //write flags byte
        this.writer.writeByte(flagsByte);

        //Encode fitting tables
        if (hasShapes)
            this.encodeArray(this.shapes);

        //Encode actual data
        this.encodeUnknown(data);

        return this.writer.finish();
    }
}