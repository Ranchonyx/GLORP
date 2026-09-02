export class ByteBuffer extends Buffer {
    writeUInt24BE(value, offset = 0) {
        if (value < 0 || value > 0xFFFFFF) {
            throw new RangeError("UInt24 out of range.");
        }
        this[offset] = (value >>> 16) & 0xFF;
        this[offset + 1] = (value >>> 8) & 0xFF;
        this[offset + 2] = value & 0xFF;
        return offset + 3;
    }
    writeInt24BE(value, offset = 0) {
        if (value < -0x800000 || value > 0x7FFFFF) {
            throw new RangeError("Int24 out of range.");
        }
        if (value < 0) {
            value += 0x1000000;
        }
        return this.writeUInt24BE(value, offset);
    }
    readUInt24BE(offset = 0) {
        return ((this[offset] << 16) |
            (this[offset + 1] << 8) |
            this[offset + 2]);
    }
    readInt24BE(offset = 0) {
        const value = this.readUInt24BE(offset);
        return value & 0x800000
            ? value - 0x1000000
            : value;
    }
    writeUInt48BE(value, offset = 0) {
        if (value < 0 || value > 0xFFFFFFFFFFFF) {
            throw new RangeError("UInt48 out of range.");
        }
        this[offset] = Math.floor(value / 0x10000000000) & 0xFF;
        this[offset + 1] = Math.floor(value / 0x100000000) & 0xFF;
        this[offset + 2] = Math.floor(value / 0x1000000) & 0xFF;
        this[offset + 3] = Math.floor(value / 0x10000) & 0xFF;
        this[offset + 4] = Math.floor(value / 0x100) & 0xFF;
        this[offset + 5] = value & 0xFF;
        return offset + 6;
    }
    writeInt48BE(value, offset = 0) {
        if (value < -0x800000000000 || value > 0x7FFFFFFFFFFF) {
            throw new RangeError("Int48 out of range.");
        }
        if (value < 0) {
            value += 0x1000000000000;
        }
        return this.writeUInt48BE(value, offset);
    }
    readUInt48BE(offset = 0) {
        return (this[offset] * 0x10000000000 +
            this[offset + 1] * 0x100000000 +
            this[offset + 2] * 0x1000000 +
            this[offset + 3] * 0x10000 +
            this[offset + 4] * 0x100 +
            this[offset + 5]);
    }
    readInt48BE(offset = 0) {
        const value = this.readUInt48BE(offset);
        return value >= 0x800000000000
            ? value - 0x1000000000000
            : value;
    }
    writeBigUInt56BE(value, offset = 0) {
        if (value < 0n || value > 0xffffffffffffffn)
            throw new RangeError("UInt56 out of range.");
        for (let i = 6; i >= 0; i--) {
            this[offset + i] = Number(value & 0xffn);
            value >>= 8n;
        }
        return offset + 7;
    }
    writeBigInt56BE(value, offset = 0) {
        if (value < -0x80000000000000n ||
            value > 0x7fffffffffffffn) {
            throw new RangeError("Int56 out of range.");
        }
        if (value < 0n)
            value += 0x100000000000000n;
        return this.writeBigUInt56BE(value, offset);
    }
    readBigUInt56BE(offset = 0) {
        let value = 0n;
        for (let i = 0; i < 7; i++) {
            value = (value << 8n) | BigInt(this[offset + i]);
        }
        return value;
    }
    readBigInt56BE(offset = 0) {
        const value = this.readBigUInt56BE(offset);
        return value & 0x80000000000000n
            ? value - 0x100000000000000n
            : value;
    }
    writeInt56BE(value, offset = 0) {
        if (!Number.isSafeInteger(value))
            throw new RangeError("Int56 value must be a safe integer.");
        return this.writeBigInt56BE(BigInt(value), offset);
    }
    readInt56BE(offset = 0) {
        const value = this.readBigInt56BE(offset);
        const number = Number(value);
        if (!Number.isSafeInteger(number))
            throw new RangeError("Int56 value must be a safe integer.");
        return number;
    }
    subarray(start, end) {
        const subarray = super.subarray(start, end);
        return ByteBuffer.promote(subarray);
    }
    static promote(buffer) {
        Object.setPrototypeOf(buffer, ByteBuffer.prototype);
        return buffer;
    }
    static fromBuffer(buffer) {
        const newBuffer = ByteBuffer.alloc(buffer.byteLength);
        buffer.copy(newBuffer);
        return this.promote(newBuffer);
    }
    static alloc(size) {
        const buffer = Buffer.allocUnsafe(size);
        return this.promote(buffer);
    }
}
export class ByteBufferStream {
    offset = 0;
    length;
    buffer;
    constructor(buf) {
        this.buffer = ByteBuffer.fromBuffer(buf);
        this.length = buf.byteLength;
    }
    peekByte() {
        if (this.eof) {
            throw new RangeError("Unexpected end of stream.");
        }
        return this.buffer[this.offset];
    }
    peekSlice(amount = 0xffffffff) {
        return this.buffer.subarray(this.offset, this.offset + amount);
    }
    skip(amount) {
        this.offset += amount;
    }
    get eof() {
        return this.offset >= this.length;
    }
}
//# sourceMappingURL=ByteBuffer.js.map