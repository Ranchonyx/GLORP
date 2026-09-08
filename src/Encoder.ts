import {GLORP_MAGIC, ShapeEntry, SymbolState, TAGS} from "./Util/Constants.js";
import {InvalidArgumentEncodeError, InvalidArgumentRangeError} from "./Util/Errors.js";
import {BufferedWriter} from "./Util/BufferedWriter";

export class BufferedEncoder {
    private stringData = new Map<string, number>();
    private nextStringIndex = 0;

    private shapeEntries: ShapeEntry[] = [];
    private lastShapeEntry: ShapeEntry | null = null;
    private nextShapeIndex = 0;

    private encodeUTF8String(utf8String: string, len: number): void {
        if (len <= 0xff) {
            this.writer.writeByte(TAGS.STU8);
            this.writer.writeUInt8(len);
            this.writer.writeString(utf8String, len, "utf8");
            return;
        }

        if (len <= 0xff_ff) {
            this.writer.writeByte(TAGS.STU16);
            this.writer.writeUInt16BE(len);
            this.writer.writeString(utf8String, len, "utf8");
            return;

        }

        if (len <= 0xff_ff_ff) {
            this.writer.writeByte(TAGS.STU24);
            this.writer.writeUInt24BE(len);
            this.writer.writeString(utf8String, len, "utf8");
            return;
        }

        if (len <= 0xff_ff_ff_ff) {
            this.writer.writeByte(TAGS.STU32);
            this.writer.writeUInt32BE(len);
            this.writer.writeString(utf8String, len, "utf8");
            return;
        }

        throw new InvalidArgumentRangeError(utf8String, 0xff_ff_ff_ff);
    }

    private encodeASCIIString(asciiString: string, len: number): void {
        if (len <= 0xff) {
            this.writer.writeByte(TAGS.STA8);
            this.writer.writeUInt8(len);
            this.writer.writeString(asciiString, len, "ascii");
            return;
        }

        if (len <= 0xff_ff) {
            this.writer.writeByte(TAGS.STA16);
            this.writer.writeUInt16BE(len);
            this.writer.writeString(asciiString, len, "ascii");
            return;
        }

        if (len <= 0xff_ff_ff) {
            this.writer.writeByte(TAGS.STA24);
            this.writer.writeUInt24BE(len);
            this.writer.writeString(asciiString, len, "ascii");
            return;
        }

        if (len <= 0xff_ff_ff_ff) {
            this.writer.writeByte(TAGS.STA32);
            this.writer.writeUInt32BE(len);
            this.writer.writeString(asciiString, len, "ascii");
            return;
        }

        throw new InvalidArgumentRangeError(asciiString, 0xff_ff_ff_ff);
    }

    private encodeStringUTFOrASCII(x: string): void {
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
            case "number":
            case "undefined":
                return true;
        }

        return data === null;
    }

    private encodePrimitive(data: unknown) {
        if (typeof data === "number" || typeof data === "bigint")
            return this.encodeNumber(data);
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

    private encodeArray(array: unknown[]): void {
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
            this.encodeUnknown(element);
    }

    private encodeRecord(data: Record<string, unknown>, keys: string[] = Object.keys(data)): void {
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
        encodeMeta(keys.length);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            this.encodeString(key);
            this.encodeUnknown(data[key]);
        }
    }

    private matchesShape(keys: string[], entry: ShapeEntry) {
        if (keys.length !== entry.keys.length)
            return false;

        for (let i = 0; i < keys.length; i++)
            if (keys[i] !== entry.keys[i])
                return false;

        return true;
    }

    private findShapeEntry(keys: string[]) {
        const last = this.lastShapeEntry;

        if (last && this.matchesShape(keys, last))
            return last;

        for (let i = 0; i < this.shapeEntries.length; i++) {
            const entry = this.shapeEntries[i];

            if (this.matchesShape(keys, entry))
                return entry;
        }

        return null;
    }

    private encodeObject(data: Record<string, unknown>): void {
        const keys = Object.keys(data);
        let entry = this.findShapeEntry(keys);

        if (entry === null) {
            entry = {
                state: SymbolState.UNIQUE,
                keys,
                encodedShape: JSON.stringify(keys)
            }

            this.shapeEntries.push(entry);
            this.lastShapeEntry = entry;

            this.encodeRecord(data);
            return;
        }

        this.lastShapeEntry = entry;
        if (entry.state === SymbolState.UNIQUE) {
            entry.state = SymbolState.DEFINED;
            entry.index = this.nextShapeIndex++;

            this.encodeShapeDefinition(data, entry as Required<ShapeEntry>);
            return;
        }

        this.encodeShapeReference(data, entry as Required<ShapeEntry>);
    }

    private encodeString(data: string): void {
        const index = this.stringData.get(data);

        if (index === undefined) {
            this.stringData.set(data, -1);
            this.encodeStringUTFOrASCII(data);
            return;
        }

        if (index === -1) {
            const definedIndex = this.nextStringIndex++;
            this.stringData.set(data, definedIndex);

            this.writer.writeByte(TAGS.SP_STRING_DEF);
            this.encodeNumber(definedIndex);
            this.encodeStringUTFOrASCII(data);
            return;
        }

        this.writer.writeByte(TAGS.SP_STRING_REF);
        this.encodeNumber(index);
    }

    private encodeUnknown(data: unknown) {
        //Check if we need to encode a primitive first
        if (typeof data === "string")
            return this.encodeString(data);

        if (this.isPrimitive(data))
            return this.encodePrimitive(data);

        if (Object.getPrototypeOf(data) === Date.prototype)
            return this.encodeDate(data as Date);

        //If we're dealing with an array
        if (Array.isArray(data))
            return this.encodeArray(data)

        const proto = Object.getPrototypeOf(data);
        if (typeof data === "object" && (proto === null || Object.getPrototypeOf(proto) === null))
            return this.encodeObject(data as Record<string, unknown>);

        throw new InvalidArgumentEncodeError(data);
    }

    private encodeShapeValues(data: Record<string, unknown>, entry: Required<ShapeEntry>): void {
        this.encodeNumber(entry.keys.length);

        for (let i = 0; i < entry.keys.length; i++)
            this.encodeUnknown(data[entry.keys[i]]);
    }

    private encodeShapeDefinition(data: Record<string, unknown>, entry: Required<ShapeEntry>): void {
        this.writer.writeByte(TAGS.SP_SHAPE_DEF);
        this.encodeNumber(entry.index);
        this.encodeStringUTFOrASCII(entry.encodedShape);
        this.encodeShapeValues(data, entry);
    }

    private encodeShapeReference(data: Record<string, unknown>, entry: Required<ShapeEntry>): void {
        this.writer.writeByte(TAGS.SP_SHAPE_REF);
        this.encodeNumber(entry.index);
        this.encodeShapeValues(data, entry);
    }

    public constructor(private writer: BufferedWriter) {
    }

    public Encode(data: unknown): Buffer {
        this.writer.reset();

        this.stringData.clear();
        this.nextStringIndex = 0;

        this.shapeEntries = [];
        this.lastShapeEntry = null;
        this.nextShapeIndex = 0;

        //Write magic
        this.writer.writeByte(GLORP_MAGIC);

        //Compute flags
        let flagsByte = 0x00;

        //write flags byte
        this.writer.writeByte(flagsByte);

        //Encode actual data
        this.encodeUnknown(data);

        return this.writer.finish();
    }
}