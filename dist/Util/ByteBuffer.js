import { InvalidArgumentRangeError } from "./Errors.js";
export class ByteBuffer {
    bytes;
    view;
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    constructor(bytes) {
        this.bytes = bytes;
        this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    }
    static alloc(size) {
        return new ByteBuffer(new Uint8Array(size));
    }
    static from(bytes) {
        return new ByteBuffer(bytes);
    }
    copy(target, targetStart, sourceStart, sourceEnd) {
        const src = this.bytes.subarray(sourceStart, sourceEnd);
        target.bytes.set(src, targetStart);
        return src.byteLength;
    }
    get byteLength() {
        return this.bytes.byteLength;
    }
    get buffer() {
        return this.bytes;
    }
    read(offset, length, encoding) {
        const slice = this.buffer.subarray(offset, offset + length);
        switch (encoding) {
            case "utf8":
            case "utf-8":
            case "ascii":
                return this.decoder.decode(slice);
            default:
                throw new Error(`Unsupported encoding.`);
        }
    }
    write(string, offset, encoding) {
        let encoded = null;
        switch (encoding) {
            case "utf8":
            case "utf-8":
                encoded = this.encoder.encode(string);
                break;
            case "ascii":
                encoded = new Uint8Array(string.length);
                for (let i = 0; i < string.length; i++) {
                    const code = string.charCodeAt(i);
                    if (code > 0x7F)
                        throw new Error(`Cannot ASCII-encode char '${string[i]}'!`);
                    encoded[i] = code;
                }
                break;
            default:
                throw new Error("Unsupported encoding");
        }
        this.bytes.set(encoded, offset);
        return encoded.byteLength;
    }
    writeUInt8(value, offset = 0) {
        this.view.setUint8(offset, value);
        return offset + 1;
    }
    writeInt8(value, offset = 0) {
        this.view.setInt8(offset, value);
        return offset + 1;
    }
    readUInt8(offset = 0) {
        return this.view.getUint8(offset);
    }
    readInt8(offset = 0) {
        return this.view.getInt8(offset);
    }
    writeUInt16BE(value, offset = 0) {
        this.view.setUint16(offset, value);
        return offset + 2;
    }
    writeInt16BE(value, offset = 0) {
        this.view.setInt16(offset, value);
        return offset + 2;
    }
    readUInt16BE(offset = 0) {
        return this.view.getUint16(offset);
    }
    readInt16BE(offset = 0) {
        return this.view.getInt16(offset);
    }
    writeUInt24BE(value, offset = 0) {
        if (value < 0 || value > 0xFFFFFF) {
            throw new InvalidArgumentRangeError(value, 0xFFFFFF);
        }
        this.bytes[offset] = (value >>> 16) & 0xFF;
        this.bytes[offset + 1] = (value >>> 8) & 0xFF;
        this.bytes[offset + 2] = value & 0xFF;
        return offset + 3;
    }
    writeInt24BE(value, offset = 0) {
        if (value < -0x800000 || value > 0x7FFFFF) {
            throw new InvalidArgumentRangeError(value, 0x7FFFFF, -0x800000);
        }
        if (value < 0) {
            value += 0x1000000;
        }
        return this.writeUInt24BE(value, offset);
    }
    readUInt24BE(offset = 0) {
        return ((this.bytes[offset] << 16) |
            (this.bytes[offset + 1] << 8) |
            this.bytes[offset + 2]);
    }
    readInt24BE(offset = 0) {
        const value = this.readUInt24BE(offset);
        return value & 0x800000
            ? value - 0x1000000
            : value;
    }
    writeUInt32BE(value, offset = 0) {
        this.view.setUint32(offset, value);
        return offset + 4;
    }
    writeInt32BE(value, offset = 0) {
        this.view.setInt32(offset, value);
        return offset + 4;
    }
    readUInt32BE(offset = 0) {
        return this.view.getUint32(offset);
    }
    readInt32BE(offset = 0) {
        return this.view.getInt32(offset);
    }
    writeUInt48BE(value, offset = 0) {
        if (value < 0 || value > 0xFFFFFFFFFFFF) {
            throw new InvalidArgumentRangeError(value, 0xFFFFFFFFFFFF);
        }
        this.bytes[offset] = Math.floor(value / 0x10000000000) & 0xFF;
        this.bytes[offset + 1] = Math.floor(value / 0x100000000) & 0xFF;
        this.bytes[offset + 2] = Math.floor(value / 0x1000000) & 0xFF;
        this.bytes[offset + 3] = Math.floor(value / 0x10000) & 0xFF;
        this.bytes[offset + 4] = Math.floor(value / 0x100) & 0xFF;
        this.bytes[offset + 5] = value & 0xFF;
        return offset + 6;
    }
    writeInt48BE(value, offset = 0) {
        if (value < -0x800000000000 || value > 0x7FFFFFFFFFFF) {
            throw new InvalidArgumentRangeError(value, 0x7FFFFFFFFFFF, -0x800000000000);
        }
        if (value < 0) {
            value += 0x1000000000000;
        }
        return this.writeUInt48BE(value, offset);
    }
    readUInt48BE(offset = 0) {
        return (this.bytes[offset] * 0x10000000000 +
            this.bytes[offset + 1] * 0x100000000 +
            this.bytes[offset + 2] * 0x1000000 +
            this.bytes[offset + 3] * 0x10000 +
            this.bytes[offset + 4] * 0x100 +
            this.bytes[offset + 5]);
    }
    readInt48BE(offset = 0) {
        const value = this.readUInt48BE(offset);
        return value >= 0x800000000000
            ? value - 0x1000000000000
            : value;
    }
    writeBigUInt56BE(value, offset = 0) {
        if (value < 0n || value > 0xffffffffffffffn)
            throw new InvalidArgumentRangeError(value, 0xffffffffffffffn, 0n);
        for (let i = 6; i >= 0; i--) {
            this.bytes[offset + i] = Number(value & 0xffn);
            value >>= 8n;
        }
        return offset + 7;
    }
    writeBigInt56BE(value, offset = 0) {
        if (value < -0x80000000000000n ||
            value > 0x7fffffffffffffn) {
            throw new InvalidArgumentRangeError(value, 0x7fffffffffffffn, -0x80000000000000n);
        }
        if (value < 0n)
            value += 0x100000000000000n;
        return this.writeBigUInt56BE(value, offset);
    }
    readBigUInt56BE(offset = 0) {
        let value = 0n;
        for (let i = 0; i < 7; i++) {
            value = (value << 8n) | BigInt(this.bytes[offset + i]);
        }
        return value;
    }
    readBigInt56BE(offset = 0) {
        const value = this.readBigUInt56BE(offset);
        return value & 0x80000000000000n
            ? value - 0x100000000000000n
            : value;
    }
    writeBigUInt64BE(value, offset = 0) {
        if (value < 0n ||
            value > 0xffffffffffffffffn) {
            throw new InvalidArgumentRangeError(value, 0xffffffffffffffffn, 0n);
        }
        this.view.setBigUint64(offset, value, false);
        return offset + 8;
    }
    writeBigInt64BE(value, offset = 0) {
        if (value < -0x8000000000000000n ||
            value > 0x7fffffffffffffffn) {
            throw new InvalidArgumentRangeError(value, 0x7fffffffffffffffn, -0x8000000000000000n);
        }
        this.view.setBigInt64(offset, value, false);
        return offset + 8;
    }
    readBigUInt64BE(offset = 0) {
        return this.view.getBigUint64(offset, false);
    }
    readBigInt64BE(offset = 0) {
        return this.view.getBigInt64(offset, false);
    }
    writeInt56BE(value, offset = 0) {
        if (!Number.isSafeInteger(value))
            throw new InvalidArgumentRangeError(value, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        return this.writeBigInt56BE(BigInt(value), offset);
    }
    readInt56BE(offset = 0) {
        const value = this.readBigInt56BE(offset);
        const number = Number(value);
        if (!Number.isSafeInteger(number))
            throw new InvalidArgumentRangeError(number, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        return number;
    }
    writeFloatBE(value, offset = 0) {
        this.view.setFloat32(offset, value);
        return offset + 4;
    }
    readFloatBE(offset = 0) {
        return this.view.getFloat32(offset);
    }
    writeDoubleBE(value, offset = 0) {
        this.view.setFloat64(offset, value);
        return offset + 8;
    }
    readDoubleBE(offset = 0) {
        return this.view.getFloat64(offset);
    }
}
//# sourceMappingURL=ByteBuffer.js.map