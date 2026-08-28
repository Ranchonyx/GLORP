export class ByteBuffer extends Buffer {
    public writeUInt24BE(value: number, offset: number = 0): number {
        if (value < 0 || value > 0xFFFFFF) {
            throw new RangeError("UInt24 out of range.");
        }

        this[offset] = (value >>> 16) & 0xFF;
        this[offset + 1] = (value >>> 8) & 0xFF;
        this[offset + 2] = value & 0xFF;

        return offset + 3;
    }

    public writeInt24BE(value: number, offset: number = 0): number {
        if (value < -0x800000 || value > 0x7FFFFF) {
            throw new RangeError("Int24 out of range.");
        }

        if (value < 0) {
            value += 0x1000000;
        }

        return this.writeUInt24BE(value, offset);
    }

    public readUInt24BE(offset: number = 0): number {
        return (
            (this[offset] << 16) |
            (this[offset + 1] << 8) |
            this[offset + 2]
        );
    }

    public readInt24BE(offset: number = 0): number {
        const value = this.readUInt24BE(offset);

        return value & 0x800000
            ? value - 0x1000000
            : value;
    }

    public writeUInt48BE(value: number, offset: number = 0): number {
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

    public writeInt48BE(value: number, offset: number = 0): number {
        if (value < -0x800000000000 || value > 0x7FFFFFFFFFFF) {
            throw new RangeError("Int48 out of range.");
        }

        if (value < 0) {
            value += 0x1000000000000;
        }

        return this.writeUInt48BE(value, offset);
    }

    public readUInt48BE(offset: number = 0): number {
        return (
            this[offset] * 0x10000000000 +
            this[offset + 1] * 0x100000000 +
            this[offset + 2] * 0x1000000 +
            this[offset + 3] * 0x10000 +
            this[offset + 4] * 0x100 +
            this[offset + 5]
        );
    }

    public readInt48BE(offset: number = 0): number {
        const value = this.readUInt48BE(offset);

        return value >= 0x800000000000
            ? value - 0x1000000000000
            : value;
    }

    public writeBigUInt56BE(value: bigint, offset: number = 0): number {
        if (value < 0n || value > 0xFF_FF_FF_FF_FF_FF_FFn)
            throw new RangeError("UInt56 out of range.");

        for (let i = 6; i >= 0; i--) {
            this[offset + i] = Number(value & 0xFFn);
            value >>= 8n;
        }

        return offset + 7;
    }

    public writeBigInt56BE(value: bigint, offset: number = 0): number {
        if (
            value < -0x80_00_00_00_00_00_00n ||
            value > 0x7F_FF_FF_FF_FF_FF_FFn
        ) {
            throw new RangeError("Int56 out of range.");
        }

        if (value < 0n)
            value += 0x1_00_00_00_00_00_00_00n;

        return this.writeBigUInt56BE(value, offset);
    }

    public readBigUInt56BE(offset: number = 0): bigint {
        let value = 0n;

        for (let i = 0; i < 7; i++) {
            value = (value << 8n) | BigInt(this[offset + i]);
        }

        return value;
    }

    public readBigInt56BE(offset: number = 0): bigint {
        const value = this.readBigUInt56BE(offset);

        return value & 0x80_00_00_00_00_00_00n
            ? value - 0x1_00_00_00_00_00_00_00n
            : value;
    }

    public writeInt56BE(value: number, offset: number = 0): number {
        if (!Number.isSafeInteger(value))
            throw new RangeError("Int56 value must be a safe integer.");

        return this.writeBigInt56BE(BigInt(value), offset);
    }

    public readInt56BE(offset: number = 0): number {
        const value = this.readBigInt56BE(offset);

        const number = Number(value);

        if (!Number.isSafeInteger(number))
            throw new RangeError("Int56 value must be a safe integer.");

        return number;
    }

    public subarray(start?: number, end?: number): ByteBuffer {
        const subarray = super.subarray(start, end);
        return ByteBuffer.promote(subarray);
    }

    private static promote(buffer: Buffer): ByteBuffer {
        Object.setPrototypeOf(buffer, ByteBuffer.prototype);

        return buffer as ByteBuffer;
    }

    public static fromBuffer(buffer: Buffer): ByteBuffer {
        const newBuffer = ByteBuffer.alloc(buffer.byteLength);
        buffer.copy(newBuffer);

        return this.promote(newBuffer);
    }

    public static alloc(size: number): ByteBuffer {
        const buffer = Buffer.alloc(size);
        return this.promote(buffer);
    }
}

export class ByteBufferStream {
    private offset = 0;
    private readonly length: number;
    private readonly buffer: ByteBuffer;

    public constructor(buf: Buffer) {
        this.buffer = ByteBuffer.fromBuffer(buf);
        this.length = buf.byteLength;
    }

    public peekByte() {
        if (this.eof) {
            throw new RangeError("Unexpected end of stream.");
        }

        return this.buffer[this.offset];
    }

    public peekSlice(amount: number = 0xffffffff) {
        return this.buffer.subarray(this.offset, this.offset + amount);
    }

    public skip(amount: number) {
        this.offset += amount;
    }

    public get eof(): boolean {
        return this.offset >= this.length;
    }
}