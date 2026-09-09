import { ByteBuffer } from "./ByteBuffer.js";
import { InvalidArgumentRangeError } from "./Errors.js";
export class BufferedWriter {
    buffer;
    offset = 0;
    constructor(initialSize) {
        this.buffer = ByteBuffer.alloc(initialSize);
    }
    resizeTo(size) {
        const nb = ByteBuffer.alloc(size);
        this.buffer.copy(nb, 0, 0, this.offset);
        this.buffer = nb;
    }
    ensureAtLeast(size) {
        const needed = this.offset + size;
        //All good
        if (needed <= this.buffer.byteLength)
            return;
        const newSz = Math.max(needed, this.buffer.byteLength > 0 ? this.buffer.byteLength * 2 : 0xff);
        this.resizeTo(newSz);
    }
    writeUInt24BE(value) {
        if (value < 0 || value > 0xFFFFFF)
            throw new InvalidArgumentRangeError(value, 0xFFFFFF);
        this.ensureAtLeast(3);
        this.offset = this.buffer.writeUInt24BE(value, this.offset);
        return this.offset;
    }
    writeInt24BE(value) {
        if (value < -0x800000 || value > 0x7FFFFF)
            throw new InvalidArgumentRangeError(value, 0x7FFFFF, -0x800000);
        this.ensureAtLeast(3);
        this.offset = this.buffer.writeInt24BE(value, this.offset);
        return this.offset;
    }
    readUInt24BE(offset = 0) {
        return this.buffer.readUInt24BE(offset);
    }
    readInt24BE(offset = 0) {
        return this.buffer.readInt24BE(offset);
    }
    writeUInt48BE(value) {
        if (value < 0 || value > 0xFFFFFFFFFFFF)
            throw new InvalidArgumentRangeError(value, 0xFFFFFFFFFFFF);
        this.ensureAtLeast(6);
        this.offset = this.buffer.writeUInt48BE(value, this.offset);
        return this.offset;
    }
    writeInt48BE(value) {
        if (value < -0x800000000000 ||
            value > 0x7FFFFFFFFFFF) {
            throw new InvalidArgumentRangeError(value, 0x7FFFFFFFFFFF, -0x800000000000);
        }
        this.ensureAtLeast(6);
        this.offset = this.buffer.writeInt48BE(value, this.offset);
        return this.offset;
    }
    readUInt48BE(offset = 0) {
        return this.buffer.readUInt48BE(offset);
    }
    readInt48BE(offset = 0) {
        return this.buffer.readInt48BE(offset);
    }
    writeBigUInt56BE(value) {
        if (value < 0n ||
            value > 0xffffffffffffffn) {
            throw new InvalidArgumentRangeError(value, 0xffffffffffffffn, 0n);
        }
        this.ensureAtLeast(7);
        this.offset = this.buffer.writeBigUInt56BE(value, this.offset);
        return this.offset;
    }
    writeBigInt56BE(value) {
        if (value < -0x80000000000000n ||
            value > 0x7fffffffffffffn) {
            throw new InvalidArgumentRangeError(value, 0x7fffffffffffffn, -0x80000000000000n);
        }
        this.ensureAtLeast(7);
        this.offset = this.buffer.writeBigInt56BE(value, this.offset);
        return this.offset;
    }
    readBigUInt56BE(offset = 0) {
        return this.buffer.readBigUInt56BE(offset);
    }
    writeBigUInt64BE(value) {
        if (value < 0n ||
            value > 0xffffffffffffffffn) {
            throw new InvalidArgumentRangeError(value, 0xffffffffffffffffn, 0n);
        }
        this.ensureAtLeast(8);
        this.offset = this.buffer.writeBigUInt64BE(value, this.offset);
        return this.offset;
    }
    readBigUInt64BE(offset = 0) {
        return this.buffer.readBigUInt64BE(offset);
    }
    writeBigInt64BE(value) {
        if (value < -0x8000000000000000n ||
            value > 0x7fffffffffffffffn) {
            throw new InvalidArgumentRangeError(value, 0x7fffffffffffffffn, -0x8000000000000000n);
        }
        this.ensureAtLeast(8);
        this.offset = this.buffer.writeBigInt64BE(value, this.offset);
        return this.offset;
    }
    readBigInt64BE(offset = 0) {
        return this.buffer.readBigInt64BE(offset);
    }
    readBigInt56BE(offset = 0) {
        return this.buffer.readBigInt56BE(offset);
    }
    writeInt56BE(value) {
        if (!Number.isSafeInteger(value))
            throw new InvalidArgumentRangeError(value, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        this.ensureAtLeast(7);
        this.offset = this.buffer.writeInt56BE(value, this.offset);
        return this.offset;
    }
    readInt56BE(offset = 0) {
        return this.buffer.readInt56BE(offset);
    }
    writeUInt8(value) {
        this.ensureAtLeast(1);
        this.offset = this.buffer.writeUInt8(value, this.offset);
        return this.offset;
    }
    writeInt8(value) {
        this.ensureAtLeast(1);
        this.offset = this.buffer.writeInt8(value, this.offset);
        return this.offset;
    }
    writeUInt16BE(value) {
        this.ensureAtLeast(2);
        this.offset = this.buffer.writeUInt16BE(value, this.offset);
        return this.offset;
    }
    writeInt16BE(value) {
        this.ensureAtLeast(2);
        this.offset = this.buffer.writeInt16BE(value, this.offset);
        return this.offset;
    }
    writeUInt32BE(value) {
        this.ensureAtLeast(4);
        this.offset = this.buffer.writeUInt32BE(value, this.offset);
        return this.offset;
    }
    writeInt32BE(value) {
        this.ensureAtLeast(4);
        this.offset = this.buffer.writeInt32BE(value, this.offset);
        return this.offset;
    }
    writeFloatBE(value) {
        this.ensureAtLeast(4);
        this.offset = this.buffer.writeFloatBE(value, this.offset);
        return this.offset;
    }
    writeDoubleBE(value) {
        this.ensureAtLeast(8);
        this.offset = this.buffer.writeDoubleBE(value, this.offset);
        return this.offset;
    }
    writeByte(value) {
        this.ensureAtLeast(1);
        this.buffer.writeUInt8(value, this.offset++);
        return this.offset;
    }
    writeString(value, byteLength, encoding) {
        this.ensureAtLeast(byteLength);
        const written = this.buffer.write(value, this.offset, encoding);
        this.offset += written;
        return this.offset;
    }
    finish() {
        return this.buffer.buffer.subarray(0, this.offset);
    }
    reset() {
        this.offset = 0;
    }
}
//# sourceMappingURL=BufferedWriter.js.map