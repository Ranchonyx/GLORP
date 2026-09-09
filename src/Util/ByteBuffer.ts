import {InvalidArgumentRangeError} from "./Errors.js";

export type ByteBufferEncoding = "utf8" | "utf-8" | "ascii";

export class ByteBuffer {
    private readonly view: DataView;
    private readonly encoder = new TextEncoder();
    private readonly decoder = new TextDecoder();

    public constructor(private bytes: Uint8Array) {
        this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    }

    public static alloc(size: number): ByteBuffer {
        return new ByteBuffer(new Uint8Array(size));
    }

    public static from(bytes: Uint8Array): ByteBuffer {
        return new ByteBuffer(bytes);
    }

    public copy(target: ByteBuffer, targetStart?: number | undefined, sourceStart?: number | undefined, sourceEnd?: number | undefined): number {
        const src = this.bytes.subarray(sourceStart, sourceEnd);
        target.bytes.set(src, targetStart);
        return src.byteLength;
    }

    public get byteLength(): number {
        return this.bytes.byteLength;
    }

    public get buffer() {
        return this.bytes;
    }

    public read(offset: number, length: number, encoding: ByteBufferEncoding): string {
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

    public write(string: string, offset: number, encoding: ByteBufferEncoding): number {
        let encoded: Uint8Array | null = null;
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

    public writeUInt8(value: number, offset: number = 0): number {
        this.view.setUint8(offset, value);

        return offset + 1;
    }

    public writeInt8(value: number, offset: number = 0): number {
        this.view.setInt8(offset, value);

        return offset + 1;
    }

    public readUInt8(offset: number = 0): number {
        return this.view.getUint8(offset);
    }

    public readInt8(offset: number = 0): number {
        return this.view.getInt8(offset);
    }

    public writeUInt16BE(value: number, offset: number = 0): number {
        this.view.setUint16(offset, value);

        return offset + 2;
    }

    public writeInt16BE(value: number, offset: number = 0): number {
        this.view.setInt16(offset, value);

        return offset + 2;
    }

    public readUInt16BE(offset: number = 0): number {
        return this.view.getUint16(offset);
    }

    public readInt16BE(offset: number = 0): number {
        return this.view.getInt16(offset);
    }

    public writeUInt24BE(value: number, offset: number = 0): number {
        if (value < 0 || value > 0xFFFFFF) {
            throw new InvalidArgumentRangeError(value, 0xFFFFFF);
        }

        this.bytes[offset] = (value >>> 16) & 0xFF;
        this.bytes[offset + 1] = (value >>> 8) & 0xFF;
        this.bytes[offset + 2] = value & 0xFF;

        return offset + 3;
    }

    public writeInt24BE(value: number, offset: number = 0): number {
        if (value < -0x800000 || value > 0x7FFFFF) {
            throw new InvalidArgumentRangeError(value, 0x7FFFFF, -0x800000);
        }

        if (value < 0) {
            value += 0x1000000;
        }

        return this.writeUInt24BE(value, offset);
    }

    public readUInt24BE(offset: number = 0): number {
        return (
            (this.bytes[offset] << 16) |
            (this.bytes[offset + 1] << 8) |
            this.bytes[offset + 2]
        );
    }

    public readInt24BE(offset: number = 0): number {
        const value = this.readUInt24BE(offset);

        return value & 0x800000
            ? value - 0x1000000
            : value;
    }

    public writeUInt32BE(value: number, offset: number = 0): number {
        this.view.setUint32(offset, value);

        return offset + 4;
    }

    public writeInt32BE(value: number, offset: number = 0): number {
        this.view.setInt32(offset, value);

        return offset + 4;
    }

    public readUInt32BE(offset: number = 0): number {
        return this.view.getUint32(offset);
    }

    public readInt32BE(offset: number = 0): number {
        return this.view.getInt32(offset);
    }

    public writeUInt48BE(value: number, offset: number = 0): number {
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

    public writeInt48BE(value: number, offset: number = 0): number {
        if (value < -0x800000000000 || value > 0x7FFFFFFFFFFF) {
            throw new InvalidArgumentRangeError(value, 0x7FFFFFFFFFFF, -0x800000000000);
        }

        if (value < 0) {
            value += 0x1000000000000;
        }

        return this.writeUInt48BE(value, offset);
    }

    public readUInt48BE(offset: number = 0): number {
        return (
            this.bytes[offset] * 0x10000000000 +
            this.bytes[offset + 1] * 0x100000000 +
            this.bytes[offset + 2] * 0x1000000 +
            this.bytes[offset + 3] * 0x10000 +
            this.bytes[offset + 4] * 0x100 +
            this.bytes[offset + 5]
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
            throw new InvalidArgumentRangeError(value, 0xFF_FF_FF_FF_FF_FF_FFn, 0n);

        for (let i = 6; i >= 0; i--) {
            this.bytes[offset + i] = Number(value & 0xFFn);
            value >>= 8n;
        }

        return offset + 7;
    }

    public writeBigInt56BE(value: bigint, offset: number = 0): number {
        if (
            value < -0x80_00_00_00_00_00_00n ||
            value > 0x7F_FF_FF_FF_FF_FF_FFn
        ) {
            throw new InvalidArgumentRangeError(value, 0x7F_FF_FF_FF_FF_FF_FFn, -0x80_00_00_00_00_00_00n);
        }

        if (value < 0n)
            value += 0x1_00_00_00_00_00_00_00n;

        return this.writeBigUInt56BE(value, offset);
    }

    public readBigUInt56BE(offset: number = 0): bigint {
        let value = 0n;

        for (let i = 0; i < 7; i++) {
            value = (value << 8n) | BigInt(this.bytes[offset + i]);
        }

        return value;
    }

    public readBigInt56BE(offset: number = 0): bigint {
        const value = this.readBigUInt56BE(offset);

        return value & 0x80_00_00_00_00_00_00n
            ? value - 0x1_00_00_00_00_00_00_00n
            : value;
    }

    public writeBigUInt64BE(value: bigint, offset: number = 0): number {
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

        this.view.setBigUint64(offset, value, false);

        return offset + 8;
    }

    public writeBigInt64BE(value: bigint, offset: number = 0): number {
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

        this.view.setBigInt64(offset, value, false);

        return offset + 8;
    }

    public readBigUInt64BE(offset: number = 0): bigint {
        return this.view.getBigUint64(offset, false);
    }

    public readBigInt64BE(offset: number = 0): bigint {
        return this.view.getBigInt64(offset, false);
    }

    public writeInt56BE(value: number, offset: number = 0): number {
        if (!Number.isSafeInteger(value))
            throw new InvalidArgumentRangeError(value, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        return this.writeBigInt56BE(BigInt(value), offset);
    }

    public readInt56BE(offset: number = 0): number {
        const value = this.readBigInt56BE(offset);

        const number = Number(value);

        if (!Number.isSafeInteger(number))
            throw new InvalidArgumentRangeError(number, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        return number;
    }

    public writeFloatBE(value: number, offset: number = 0): number {
        this.view.setFloat32(offset, value);
        return offset + 4;
    }

    public readFloatBE(offset: number = 0): number {
        return this.view.getFloat32(offset);
    }

    public writeDoubleBE(value: number, offset: number = 0) {
        this.view.setFloat64(offset, value);
        return offset + 8;
    }

    public readDoubleBE(offset: number = 0): number {
        return this.view.getFloat64(offset);
    }
}