export class BufferedReader {
    buffer;
    offset = 0;
    constructor(buffer) {
        this.buffer = buffer;
    }
    get position() {
        return this.offset;
    }
    get remaining() {
        return this.buffer.length - this.offset;
    }
    get eof() {
        return this.offset === this.buffer.length;
    }
    ensureAvailable(size) {
        if (size > this.remaining)
            throw new RangeError(`Unexpected end of stream at offset ${this.offset}: ` +
                `need ${size} bytes, have ${this.remaining}`);
    }
    validateSize(size) {
        if (!Number.isSafeInteger(size) || size < 0)
            throw new RangeError(`Invalid byte count: ${size}`);
    }
    peekByte() {
        this.ensureAvailable(1);
        return this.buffer[this.offset];
    }
    readByte() {
        this.ensureAvailable(1);
        return this.buffer[this.offset++];
    }
    readUInt8() {
        return this.readByte();
    }
    readInt8() {
        this.ensureAvailable(1);
        const value = this.buffer.readInt8(this.offset);
        this.offset += 1;
        return value;
    }
    readUInt16BE() {
        this.ensureAvailable(2);
        const value = this.buffer.readUInt16BE(this.offset);
        this.offset += 2;
        return value;
    }
    readInt16BE() {
        this.ensureAvailable(2);
        const value = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return value;
    }
    readUInt24BE() {
        this.ensureAvailable(3);
        const value = this.buffer.readUInt24BE(this.offset);
        this.offset += 3;
        return value;
    }
    readInt24BE() {
        this.ensureAvailable(3);
        const value = this.buffer.readInt24BE(this.offset);
        this.offset += 3;
        return value;
    }
    readUInt32BE() {
        this.ensureAvailable(4);
        const value = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return value;
    }
    readInt32BE() {
        this.ensureAvailable(4);
        const value = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return value;
    }
    readUInt48BE() {
        this.ensureAvailable(6);
        const value = this.buffer.readUInt48BE(this.offset);
        this.offset += 6;
        return value;
    }
    readInt48BE() {
        this.ensureAvailable(6);
        const value = this.buffer.readInt48BE(this.offset);
        this.offset += 6;
        return value;
    }
    readBigUInt56BE() {
        this.ensureAvailable(7);
        const value = this.buffer.readBigUInt56BE(this.offset);
        this.offset += 7;
        return value;
    }
    readBigInt56BE() {
        this.ensureAvailable(7);
        const value = this.buffer.readBigInt56BE(this.offset);
        this.offset += 7;
        return value;
    }
    readInt56BE() {
        this.ensureAvailable(7);
        const value = this.buffer.readInt56BE(this.offset);
        this.offset += 7;
        return value;
    }
    readBigUInt64BE() {
        this.ensureAvailable(8);
        const value = this.buffer.readBigUInt64BE(this.offset);
        this.offset += 8;
        return value;
    }
    readBigInt64BE() {
        this.ensureAvailable(8);
        const value = this.buffer.readBigInt64BE(this.offset);
        this.offset += 8;
        return value;
    }
    readFloatBE() {
        this.ensureAvailable(4);
        const value = this.buffer.readFloatBE(this.offset);
        this.offset += 4;
        return value;
    }
    readDoubleBE() {
        this.ensureAvailable(8);
        const value = this.buffer.readDoubleBE(this.offset);
        this.offset += 8;
        return value;
    }
    readString(byteLength, encoding) {
        this.validateSize(byteLength);
        this.ensureAvailable(byteLength);
        const end = this.offset + byteLength;
        const value = this.buffer.toString(encoding, this.offset, end);
        this.offset = end;
        return value;
    }
    skip(byteLength) {
        this.validateSize(byteLength);
        this.ensureAvailable(byteLength);
        this.offset += byteLength;
    }
    reset() {
        this.offset = 0;
    }
}
//# sourceMappingURL=BufferedReader.js.map