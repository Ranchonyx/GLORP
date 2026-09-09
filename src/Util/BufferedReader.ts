import {ByteBuffer, ByteBufferEncoding} from "./ByteBuffer.js";

export class BufferedReader {
    private offset = 0;

    public constructor(public readonly buffer: ByteBuffer) {
    }

    public get remaining(): number {
        return this.buffer.byteLength - this.offset;
    }

    public get eof(): boolean {
        return this.offset === this.buffer.byteLength;
    }

    private ensureAvailable(size: number): void {
        if (size > this.remaining)
            throw new RangeError(`Unexpected end of stream at offset ${this.offset}: ` + `need ${size} bytes, have ${this.remaining}`);
    }

    private validateSize(size: number): void {
        if (!Number.isSafeInteger(size) || size < 0)
            throw new RangeError(`Invalid byte count: ${size}`);
    }

    public peekByte(): number {
        this.ensureAvailable(1);
        return this.buffer.readUInt8(this.offset);
    }

    public readByte(): number {
        this.ensureAvailable(1);
        return this.buffer.readUInt8(this.offset++);
    }

    public readUInt8(): number {
        return this.readByte();
    }

    public readInt8(): number {
        this.ensureAvailable(1);
        const value = this.buffer.readInt8(this.offset);
        this.offset += 1;
        return value;
    }

    public readUInt16BE(): number {
        this.ensureAvailable(2);
        const value = this.buffer.readUInt16BE(this.offset);
        this.offset += 2;
        return value;
    }

    public readInt16BE(): number {
        this.ensureAvailable(2);
        const value = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return value;
    }

    public readUInt24BE(): number {
        this.ensureAvailable(3);
        const value = this.buffer.readUInt24BE(this.offset);
        this.offset += 3;
        return value;
    }

    public readInt24BE(): number {
        this.ensureAvailable(3);
        const value = this.buffer.readInt24BE(this.offset);
        this.offset += 3;
        return value;
    }

    public readUInt32BE(): number {
        this.ensureAvailable(4);
        const value = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return value;
    }

    public readInt32BE(): number {
        this.ensureAvailable(4);
        const value = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return value;
    }

    public readUInt48BE(): number {
        this.ensureAvailable(6);
        const value = this.buffer.readUInt48BE(this.offset);
        this.offset += 6;
        return value;
    }

    public readInt48BE(): number {
        this.ensureAvailable(6);
        const value = this.buffer.readInt48BE(this.offset);
        this.offset += 6;
        return value;
    }

    public readBigUInt56BE(): bigint {
        this.ensureAvailable(7);
        const value = this.buffer.readBigUInt56BE(this.offset);
        this.offset += 7;
        return value;
    }

    public readBigInt56BE(): bigint {
        this.ensureAvailable(7);
        const value = this.buffer.readBigInt56BE(this.offset);
        this.offset += 7;
        return value;
    }

    public readInt56BE(): number {
        this.ensureAvailable(7);
        const value = this.buffer.readInt56BE(this.offset);
        this.offset += 7;
        return value;
    }

    public readBigUInt64BE(): bigint {
        this.ensureAvailable(8);
        const value = this.buffer.readBigUInt64BE(this.offset);
        this.offset += 8;
        return value;
    }

    public readBigInt64BE(): bigint {
        this.ensureAvailable(8);
        const value = this.buffer.readBigInt64BE(this.offset);
        this.offset += 8;
        return value;
    }

    public readFloatBE(): number {
        this.ensureAvailable(4);
        const value = this.buffer.readFloatBE(this.offset);
        this.offset += 4;
        return value;
    }

    public readDoubleBE(): number {
        this.ensureAvailable(8);
        const value = this.buffer.readDoubleBE(this.offset);
        this.offset += 8;
        return value;
    }

    public readString(
        byteLength: number,
        encoding: ByteBufferEncoding
    ): string {
        this.validateSize(byteLength);
        this.ensureAvailable(byteLength);

        const end = this.offset + byteLength;

        const value = this.buffer.read(this.offset, byteLength, encoding);
        this.offset = end;

        return value;
    }

    public skip(byteLength: number): void {
        this.validateSize(byteLength);
        this.ensureAvailable(byteLength);
        this.offset += byteLength;
    }
}