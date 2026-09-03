import { ByteBuffer } from "./ByteBuffer";
import { InvalidArgumentRangeError } from "./Errors";
export class BufferedWriter {
    buffer;
    offset = 0;
    constructor(initialSize = 512) {
        this.buffer = ByteBuffer.alloc(initialSize);
    }
    resizeTo(size) {
        const nb = ByteBuffer.alloc(size);
        this.buffer.copy(nb);
        this.buffer = nb;
    }
    ensureAtLeast(size) {
        const needed = this.offset + size;
        //All good
        if (needed <= this.buffer.byteLength)
            return;
        let newSz = this.buffer.byteLength;
        while (newSz < needed)
            newSz *= 2;
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
    writeBuffer(value) {
        this.ensureAtLeast(value.byteLength);
        value.copy(this.buffer, this.offset);
        this.offset += value.byteLength;
        return this.offset;
    }
    writeByte(value) {
        this.ensureAtLeast(1);
        this.buffer[this.offset++] = value;
        return this.offset;
    }
    finish() {
        return this.buffer.subarray(0, this.offset);
    }
}
//# sourceMappingURL=BufferedWriter.js.map