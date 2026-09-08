import { FlAGS, GLORP_MAGIC, TAGS } from "./Util/Constants.js";
import { InvalidArgumentEncodeError, InvalidArgumentRangeError } from "./Util/Errors.js";
export class BufferedEncoder {
    writer;
    shapes = [];
    shapeIndices = new Map();
    strings = [];
    stringIndices = new Map();
    dehydrateToShape(input) {
        const isRecord = (value) => typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            !(value instanceof Date);
        const getNestedKeysAsArrayOfArrays = (obj) => {
            const keysArray = [];
            if (typeof obj === "object")
                for (let key in obj) {
                    keysArray.push(key);
                    if (isRecord(obj[key]))
                        keysArray.push(getNestedKeysAsArrayOfArrays(obj[key]));
                }
            return keysArray;
        };
        return getNestedKeysAsArrayOfArrays(input);
    }
    encodeUTF8String(utf8String, len) {
        if (len <= 0xff) {
            this.writer.writeByte(TAGS.STU8);
            this.writer.writeUInt8(len);
            this.writer.writeBuffer(Buffer.from(utf8String, "utf8"));
            return;
        }
        if (len <= 65535) {
            this.writer.writeByte(TAGS.STU16);
            this.writer.writeUInt16BE(len);
            this.writer.writeBuffer(Buffer.from(utf8String, "utf8"));
            return;
        }
        if (len <= 16777215) {
            this.writer.writeByte(TAGS.STU24);
            this.writer.writeUInt24BE(len);
            this.writer.writeBuffer(Buffer.from(utf8String, "utf8"));
            return;
        }
        if (len <= 4294967295) {
            this.writer.writeByte(TAGS.STU32);
            this.writer.writeUInt32BE(len);
            this.writer.writeBuffer(Buffer.from(utf8String, "utf8"));
            return;
        }
        throw new InvalidArgumentRangeError(utf8String, 4294967295);
    }
    encodeASCIIString(asciiString, len) {
        if (len <= 0xff) {
            this.writer.writeByte(TAGS.STA8);
            this.writer.writeUInt8(len);
            this.writer.writeBuffer(Buffer.from(asciiString, "ascii"));
            return;
        }
        if (len <= 65535) {
            this.writer.writeByte(TAGS.STA16);
            this.writer.writeUInt16BE(len);
            this.writer.writeBuffer(Buffer.from(asciiString, "ascii"));
            return;
        }
        if (len <= 16777215) {
            this.writer.writeByte(TAGS.STA24);
            this.writer.writeUInt24BE(len);
            this.writer.writeBuffer(Buffer.from(asciiString, "ascii"));
            return;
        }
        if (len <= 4294967295) {
            this.writer.writeByte(TAGS.STA32);
            this.writer.writeUInt24BE(len);
            this.writer.writeBuffer(Buffer.from(asciiString, "ascii"));
            return;
        }
        throw new InvalidArgumentRangeError(asciiString, 4294967295);
    }
    encodeString(x) {
        const byteLength = Buffer.byteLength(x);
        if (x.length === byteLength)
            return this.encodeASCIIString(x, byteLength);
        return this.encodeUTF8String(x, byteLength);
    }
    encodeBoolean(data) {
        if (data === true) {
            this.writer.writeByte(TAGS.TRU);
            return;
        }
        this.writer.writeByte(TAGS.FLS);
    }
    encodeAbsence(_) {
        this.writer.writeByte(TAGS.ABS);
    }
    _sign(value) {
        if (typeof value === "bigint")
            return value < 0n ? -1 : value > 0n ? 1 : 0;
        return Math.sign(value);
    }
    encodeInteger(integer) {
        const encodePositiveInteger = (positiveInteger) => {
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
            if (positiveInteger <= 65535) {
                this.writer.writeByte(TAGS.U16);
                this.writer.writeUInt16BE(positiveInteger);
                return;
            }
            if (positiveInteger <= 16777215) {
                this.writer.writeByte(TAGS.U24);
                this.writer.writeUInt24BE(positiveInteger);
                return;
            }
            if (positiveInteger <= 4294967295) {
                this.writer.writeByte(TAGS.U32);
                this.writer.writeUInt32BE(positiveInteger);
                return;
            }
            if (positiveInteger <= 281474976710655) {
                this.writer.writeByte(TAGS.U48);
                this.writer.writeUInt48BE(positiveInteger);
                return;
            }
            this.writer.writeByte(TAGS.UBI);
            this.writer.writeBigUInt64BE(BigInt(positiveInteger));
        };
        const encodeNegativeInteger = (negativeInteger) => {
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
        };
        const sign = this._sign(integer);
        if (sign === 1 || sign === 0)
            return encodePositiveInteger(integer);
        if (sign === -1)
            return encodeNegativeInteger(integer);
        throw new InvalidArgumentEncodeError(integer);
    }
    encodeFloat(float) {
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
    encodeNumber(x) {
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
    isPrimitive(data) {
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
    encodePrimitive(data) {
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
    encodeDate(data) {
        this.writer.writeByte(TAGS.DATE);
        this.writer.writeInt56BE(data.valueOf());
    }
    encodeArray(array, createStringReferences = true) {
        const encodeMeta = (count) => {
            if (count <= 0xff) {
                this.writer.writeByte(TAGS.ARR8);
                this.writer.writeByte(count);
                return;
            }
            if (count <= 65535) {
                this.writer.writeByte(TAGS.ARR16);
                this.writer.writeUInt16BE(count);
                return;
            }
            if (count <= 16777215) {
                this.writer.writeByte(TAGS.ARR24);
                this.writer.writeUInt24BE(count);
                return;
            }
            if (count <= 4294967295) {
                this.writer.writeByte(TAGS.ARR32);
                this.writer.writeUInt32BE(count);
                return;
            }
            throw new InvalidArgumentRangeError(array, 4294967295);
        };
        encodeMeta(array.length);
        for (const element of array)
            this.encodeUnknown(element, createStringReferences);
    }
    encodeRecord(data) {
        const encodeMeta = (len) => {
            if (len <= 0xff) {
                this.writer.writeByte(TAGS.REC8);
                this.writer.writeByte(len);
                return;
            }
            if (len <= 65535) {
                this.writer.writeByte(TAGS.REC16);
                this.writer.writeUInt16BE(len);
                return;
            }
            if (len <= 16777215) {
                this.writer.writeByte(TAGS.REC24);
                this.writer.writeUInt24BE(len);
                return;
            }
            if (len <= 4294967295) {
                this.writer.writeByte(TAGS.REC32);
                this.writer.writeUInt32BE(len);
                return;
            }
            throw new InvalidArgumentRangeError(data, 4294967295);
        };
        const entries = Object.entries(data);
        encodeMeta(entries.length);
        for (const [key, value] of entries) {
            this.encodeString(key);
            this.encodeUnknown(value);
        }
    }
    encodeUnknown(data, createStringReferences = true) {
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
            return this.encodeDate(data);
        //If we're dealing with an array
        if (Array.isArray(data))
            return this.encodeArray(data);
        const proto = Object.getPrototypeOf(data);
        if (typeof data === "object" && (proto === null || Object.getPrototypeOf(proto) === null)) {
            const shape = JSON.stringify(this.dehydrateToShape(data));
            const shapeIndex = this.shapeIndices.get(shape);
            if (shapeIndex !== undefined)
                return this.encodeShapeReference(data, shapeIndex);
            return this.encodeRecord(data);
        }
        throw new InvalidArgumentEncodeError(data);
    }
    encodeShapeReference(data, index) {
        const values = Object.values(data);
        this.writer.writeByte(TAGS.SP_SHAPE_REF);
        this.encodeNumber(index);
        this.encodeNumber(values.length);
        for (const value of values) {
            this.encodeUnknown(value);
        }
    }
    encodeStringReference(index) {
        this.writer.writeByte(TAGS.SP_STRING_REF);
        this.encodeNumber(index);
    }
    constructor(writer) {
        this.writer = writer;
    }
    Encode(data) {
        this.shapes = [];
        this.shapeIndices.clear();
        this.strings = [];
        this.stringIndices.clear();
        const shapeCounts = new Map();
        const stringCounts = new Map();
        const scan = (value) => {
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
                const shape = JSON.stringify(this.dehydrateToShape(value));
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
        //Write magic
        this.writer.writeByte(GLORP_MAGIC);
        //Compute flags
        let flagsByte = 0x00;
        const hasShapes = this.shapes.length > 0;
        if (hasShapes)
            flagsByte |= FlAGS.TAB_SHAPES;
        const hasStrings = this.strings.length > 0;
        if (hasStrings)
            flagsByte |= FlAGS.TAB_STRINGS;
        //write flags byte
        this.writer.writeByte(flagsByte);
        //Encode fitting tables
        if (hasShapes)
            this.encodeArray(this.shapes);
        if (hasStrings)
            this.encodeArray(this.strings, false);
        //Encode actual data
        this.encodeUnknown(data);
        return this.writer.finish();
    }
}
