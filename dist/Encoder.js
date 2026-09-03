import { encodePrimitive, isPrimitive } from "./Encoders/PrimitiveEncoder.js";
import { encodeDate } from "./Encoders/DateEncoder.js";
import { FlAGS, GLORP_MAGIC, TAGS } from "./Util/Constants.js";
import { ByteBuffer } from "./Util/ByteBuffer.js";
import { encodeString } from "./Encoders/StringEncoder.js";
import { encodeNumber } from "./Encoders/NumberEncoder.js";
import { InvalidArgumentEncodeError, InvalidArgumentRangeError } from "./Util/Errors.js";
function buf(len) {
    return ByteBuffer.alloc(len);
}
export class Encoder {
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
    constructor() {
    }
    encodeArray(array, createStringReferences = true) {
        const elements = [];
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
    encodeRecord(data) {
        const entries = Object.entries(data);
        const encoded = [];
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
    encodeUnknown(data, createStringReferences = true) {
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
            return encodeDate(data);
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
        const encoded = [];
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
    encodeStringReference(index) {
        return Buffer.concat([
            Buffer.of(TAGS.SP_STRING_REF),
            encodeNumber(index)
        ]);
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
        let flagsByte = 0x00;
        const tables = [];
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
//# sourceMappingURL=Encoder.js.map