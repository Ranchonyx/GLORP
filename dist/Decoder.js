import { GLORP_MAGIC, TAGS } from "./Util/Constants.js";
import { InvalidBytecodeDecodeError } from "./Util/Errors.js";
export class BufferedDecoder {
    stream;
    stringData = new Map();
    shapeData = new Map;
    constructor(stream) {
        this.stream = stream;
    }
    rehydrateShape(shape, values) {
        let shapeIndex = 0;
        let valueIndex = 0;
        const result = {};
        //Test here first, since at the top level, every shape is an array at least once
        if (!Array.isArray(shape))
            throw new Error(`While rehydrating shape ${JSON.stringify(shape)}: Shape is invalid - not an array.`);
        while (shapeIndex < shape.length) {
            const key = shape[shapeIndex];
            if (typeof key !== "string")
                throw new Error(`While rehydrating shape ${JSON.stringify(shape)}: Shape key ${key} is invalid - not a string.`);
            const maybeNextShape = shape[shapeIndex + 1];
            let value;
            if (Array.isArray(values))
                value = values[valueIndex];
            else
                value = values[key];
            //If our next shape is an array, it must be a nested record's keys
            if (Array.isArray(maybeNextShape)) {
                result[key] = this.rehydrateShape(maybeNextShape, value);
                shapeIndex += 2;
            }
            else {
                //If it isn't, it's a property, so apply the value to it
                result[key] = value;
                shapeIndex++;
            }
            valueIndex++;
        }
        return result;
    }
    decodeNumber() {
        const tag = this.stream.readByte();
        switch (tag) {
            case TAGS.PI:
                return +Infinity;
            case TAGS.NI:
                return -Infinity;
            case TAGS.NN:
                return NaN;
            case TAGS.PZ:
                return +0;
            case TAGS.NZ:
                return -0;
            case TAGS.U8:
                return this.stream.readUInt8();
            case TAGS.U16:
                return this.stream.readUInt16BE();
            case TAGS.U24:
                return this.stream.readUInt24BE();
            case TAGS.U32:
                return this.stream.readUInt32BE();
            case TAGS.U48:
                return this.stream.readUInt48BE();
            case TAGS.U56:
                return this.stream.readBigUInt56BE();
            case TAGS.UBI:
                return this.stream.readBigUInt64BE();
            case TAGS.S8:
                return this.stream.readInt8();
            case TAGS.S16:
                return this.stream.readInt16BE();
            case TAGS.S24:
                return this.stream.readInt24BE();
            case TAGS.S32:
                return this.stream.readInt32BE();
            case TAGS.S48:
                return this.stream.readInt48BE();
            case TAGS.S56:
                return this.stream.readInt32BE();
            case TAGS.SBI:
                return this.stream.readBigInt64BE();
            case TAGS.F32:
                return this.stream.readFloatBE();
            case TAGS.F64:
                return this.stream.readDoubleBE();
        }
        throw new InvalidBytecodeDecodeError(`number | bigint`, this.stream.peekByte());
    }
    decodeString() {
        const tag = this.stream.readByte();
        switch (tag) {
            case TAGS.STA8:
                return this.stream.readString(this.stream.readUInt8(), "ascii");
            case TAGS.STA16:
                return this.stream.readString(this.stream.readUInt16BE(), "ascii");
            case TAGS.STA24:
                return this.stream.readString(this.stream.readUInt24BE(), "ascii");
            case TAGS.STA32:
                return this.stream.readString(this.stream.readUInt32BE(), "ascii");
            case TAGS.STU8:
                return this.stream.readString(this.stream.readUInt8(), "utf8");
            case TAGS.STU16:
                return this.stream.readString(this.stream.readUInt16BE(), "utf8");
            case TAGS.STU24:
                return this.stream.readString(this.stream.readUInt24BE(), "utf8");
            case TAGS.STU32:
                return this.stream.readString(this.stream.readUInt32BE(), "utf8");
        }
        throw new InvalidBytecodeDecodeError("string", this.stream.peekByte());
    }
    decodeBoolean() {
        const tag = this.stream.readByte();
        switch (tag) {
            case TAGS.TRU:
                return true;
            case TAGS.FLS:
                return false;
        }
        throw new InvalidBytecodeDecodeError("boolean", this.stream.peekByte());
    }
    decodeAbsence() {
        const tag = this.stream.readByte();
        if (tag === TAGS.ABS)
            return null;
        throw new InvalidBytecodeDecodeError("null", this.stream.peekByte());
    }
    decodeArray() {
        const tag = this.stream.readByte();
        let elementCount;
        switch (tag) {
            case TAGS.ARR8:
                elementCount = this.stream.readByte();
                break;
            case TAGS.ARR16:
                elementCount = this.stream.readUInt16BE();
                break;
            case TAGS.ARR24:
                elementCount = this.stream.readUInt24BE();
                break;
            case TAGS.ARR32:
                elementCount = this.stream.readUInt32BE();
                break;
            default:
                throw new InvalidBytecodeDecodeError("array", this.stream.peekByte());
        }
        const values = [];
        for (let i = 0; i < elementCount; i++) {
            values.push(this.decodeUnknown());
        }
        return values;
    }
    decodeRecord() {
        const tag = this.stream.readByte();
        let elementCount;
        switch (tag) {
            case TAGS.REC8:
                elementCount = this.stream.readByte();
                break;
            case TAGS.REC16:
                elementCount = this.stream.readUInt16BE();
                break;
            case TAGS.REC24:
                elementCount = this.stream.readUInt24BE();
                break;
            case TAGS.REC32:
                elementCount = this.stream.readUInt32BE();
                break;
            default:
                throw new InvalidBytecodeDecodeError("record", this.stream.peekByte());
        }
        const record = {};
        for (let i = 0; i < elementCount; i++) {
            const key = this.decodeString();
            record[key] = this.decodeUnknown();
        }
        return record;
    }
    decodeStringDefinition() {
        this.stream.skip(1);
        const stringDataIndex = this.decodeNumber();
        const stringDataValue = this.decodeString();
        this.stringData.set(Number(stringDataIndex), stringDataValue);
        return stringDataValue;
    }
    decodeStringReference() {
        this.stream.skip(1);
        const index = this.decodeNumber();
        const data = this.stringData.get(Number(index));
        if (data === undefined)
            throw new Error(`While decoding string at index ${index}: No corresponding string found.`);
        return data;
    }
    decodeShapeDefinition() {
        this.stream.skip(1);
        const shapeDataIndex = this.decodeNumber();
        const recordShapeJSON = this.decodeString();
        const valuesLength = this.decodeNumber();
        const values = [];
        //VALUES
        for (let i = 0; i < Number(valuesLength); i++) {
            values.push(this.decodeUnknown());
        }
        const shape = JSON.parse(recordShapeJSON);
        this.shapeData.set(Number(shapeDataIndex), shape);
        return this.rehydrateShape(shape, values);
    }
    decodeShapeReference() {
        this.stream.skip(1);
        const index = this.decodeNumber();
        const count = this.decodeNumber();
        const shape = this.shapeData.get(Number(index));
        if (shape === undefined)
            throw new Error(`While decoding shape at index ${index}: No corresponding shape found.`);
        const values = [];
        for (let i = 0; i < Number(count); i++) {
            values.push(this.decodeUnknown());
        }
        return this.rehydrateShape(shape, values);
    }
    decodeDate() {
        this.stream.skip(1);
        const encodedEpoch = this.stream.readInt56BE();
        return new Date(encodedEpoch);
    }
    decodeUnknown() {
        const tag = this.stream.peekByte();
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
        throw new InvalidBytecodeDecodeError("unknown", this.stream.peekByte());
    }
    Decode() {
        const elements = [];
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
        return (elements.length > 1 ? elements : elements[0]);
    }
}
//# sourceMappingURL=Decoder.js.map