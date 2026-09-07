import {ByteBuffer} from "./ByteBuffer";
import {InvalidArgumentRangeError} from "./Errors";

export class BufferedWriter {
    private buffer: ByteBuffer;
    private offset = 0;

    public constructor(initialSize: number = 512) {
        this.buffer = ByteBuffer.alloc(initialSize);
    }

    private resizeTo(size: number) {
        const nb = ByteBuffer.alloc(size);
        this.buffer.copy(nb);

        this.buffer = nb;
    }

    private ensureAtLeast(size: number) {
        const needed = this.offset + size;

        //All good
        if (needed <= this.buffer.byteLength)
            return;

        let newSz = this.buffer.byteLength;
        while (newSz < needed)
            newSz *= 2;

        this.resizeTo(newSz);
    }

    public writeUInt24BE(value: number): number {
        if (value < 0 || value > 0xFFFFFF)
            throw new InvalidArgumentRangeError(value, 0xFFFFFF);

        this.ensureAtLeast(3);

        this.offset = this.buffer.writeUInt24BE(value, this.offset);

        return this.offset;
    }

    public writeInt24BE(value: number): number {
        if (value < -0x800000 || value > 0x7FFFFF)
            throw new InvalidArgumentRangeError(
                value,
                0x7FFFFF,
                -0x800000
            );

        this.ensureAtLeast(3);

        this.offset = this.buffer.writeInt24BE(value, this.offset);

        return this.offset;
    }

    public readUInt24BE(offset: number = 0): number {
        return this.buffer.readUInt24BE(offset);
    }

    public readInt24BE(offset: number = 0): number {
        return this.buffer.readInt24BE(offset);
    }

    public writeUInt48BE(value: number): number {
        if (value < 0 || value > 0xFFFFFFFFFFFF)
            throw new InvalidArgumentRangeError(
                value,
                0xFFFFFFFFFFFF
            );

        this.ensureAtLeast(6);

        this.offset = this.buffer.writeUInt48BE(value, this.offset);

        return this.offset;
    }

    public writeInt48BE(value: number): number {
        if (
            value < -0x800000000000 ||
            value > 0x7FFFFFFFFFFF
        ) {
            throw new InvalidArgumentRangeError(
                value,
                0x7FFFFFFFFFFF,
                -0x800000000000
            );
        }

        this.ensureAtLeast(6);

        this.offset = this.buffer.writeInt48BE(value, this.offset);

        return this.offset;
    }

    public readUInt48BE(offset: number = 0): number {
        return this.buffer.readUInt48BE(offset);
    }

    public readInt48BE(offset: number = 0): number {
        return this.buffer.readInt48BE(offset);
    }

    public writeBigUInt56BE(value: bigint): number {
        if (
            value < 0n ||
            value > 0xFF_FF_FF_FF_FF_FF_FFn
        ) {
            throw new InvalidArgumentRangeError(
                value,
                0xFF_FF_FF_FF_FF_FF_FFn,
                0n
            );
        }

        this.ensureAtLeast(7);

        this.offset = this.buffer.writeBigUInt56BE(
            value,
            this.offset
        );

        return this.offset;
    }

    public writeBigInt56BE(value: bigint): number {
        if (
            value < -0x80_00_00_00_00_00_00n ||
            value > 0x7F_FF_FF_FF_FF_FF_FFn
        ) {
            throw new InvalidArgumentRangeError(
                value,
                0x7F_FF_FF_FF_FF_FF_FFn,
                -0x80_00_00_00_00_00_00n
            );
        }

        this.ensureAtLeast(7);

        this.offset = this.buffer.writeBigInt56BE(
            value,
            this.offset
        );

        return this.offset;
    }


    public readBigUInt56BE(offset: number = 0): bigint {
        return this.buffer.readBigUInt56BE(offset);
    }

    public writeBigUInt64BE(value: bigint): number {
        if (
            value < 0n ||
            value > 0xFF_FF_FF_FF_FF_FF_FF_FFn
        ) {
            throw new InvalidArgumentRangeError(
                value,
                0xFF_FF_FF_FF_FF_FF_FF_FFn,
                0n
            );
        }

        this.ensureAtLeast(8);

        this.offset = this.buffer.writeBigUInt64BE(
            value,
            this.offset
        );

        return this.offset;
    }

    public readBigUInt64BE(offset: number = 0): bigint {
        return this.buffer.readBigUInt64BE(offset);
    }

    public writeBigInt64BE(value: bigint): number {
        if (
            value < -0x80_00_00_00_00_00_00_00n ||
            value > 0x7F_FF_FF_FF_FF_FF_FF_FFn
        ) {
            throw new InvalidArgumentRangeError(
                value,
                0x7F_FF_FF_FF_FF_FF_FF_FFn,
                -0x80_00_00_00_00_00_00_00n
            );
        }

        this.ensureAtLeast(8);

        this.offset = this.buffer.writeBigInt64BE(
            value,
            this.offset
        );

        return this.offset;
    }

    public readBigInt64BE(offset: number = 0): bigint {
        return this.buffer.readBigInt64BE(offset);
    }

    public readBigInt56BE(offset: number = 0): bigint {
        return this.buffer.readBigInt56BE(offset);
    }

    public writeInt56BE(value: number): number {
        if (!Number.isSafeInteger(value))
            throw new InvalidArgumentRangeError(
                value,
                Number.MAX_SAFE_INTEGER,
                Number.MIN_SAFE_INTEGER
            );

        this.ensureAtLeast(7);

        this.offset = this.buffer.writeInt56BE(
            value,
            this.offset
        );

        return this.offset;
    }

    public readInt56BE(offset: number = 0): number {
        return this.buffer.readInt56BE(offset);
    }

    public writeUInt8(value: number): number {
        this.ensureAtLeast(1);
        this.offset = this.buffer.writeUInt8(value, this.offset);

        return this.offset;
    }

    public writeInt8(value: number): number {
        this.ensureAtLeast(1);
        this.offset = this.buffer.writeInt8(value, this.offset);

        return this.offset;
    }

    public writeUInt16BE(value: number): number {
        this.ensureAtLeast(2);
        this.offset = this.buffer.writeUInt16BE(value, this.offset);

        return this.offset;
    }

    public writeInt16BE(value: number): number {
        this.ensureAtLeast(2);
        this.offset = this.buffer.writeInt16BE(value, this.offset);

        return this.offset;
    }

    public writeUInt32BE(value: number): number {
        this.ensureAtLeast(4);
        this.offset = this.buffer.writeUInt32BE(value, this.offset);

        return this.offset;
    }

    public writeInt32BE(value: number): number {
        this.ensureAtLeast(4);
        this.offset = this.buffer.writeInt32BE(value, this.offset);

        return this.offset;
    }

    public writeFloatBE(value: number): number {
        this.ensureAtLeast(4);
        this.offset = this.buffer.writeFloatBE(value, this.offset);

        return this.offset;
    }

    public writeDoubleBE(value: number): number {
        this.ensureAtLeast(8);
        this.offset = this.buffer.writeDoubleBE(value, this.offset);

        return this.offset;
    }

    public writeBuffer(value: Buffer): number {
        this.ensureAtLeast(value.byteLength);

        value.copy(this.buffer, this.offset);
        this.offset += value.byteLength;

        return this.offset;
    }

    public writeByte(value: number): number {
        this.ensureAtLeast(1);

        this.buffer[this.offset++] = value;

        return this.offset;
    }

    public finish(): ByteBuffer {
        return this.buffer.subarray(0, this.offset);
    }

    public reset(): void {
        this.offset = 0;
    }
}