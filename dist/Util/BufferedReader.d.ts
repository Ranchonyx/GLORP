import { ByteBuffer, ByteBufferEncoding } from "./ByteBuffer.js";
export declare class BufferedReader {
    readonly buffer: ByteBuffer;
    private offset;
    constructor(buffer: ByteBuffer);
    get remaining(): number;
    get eof(): boolean;
    private ensureAvailable;
    private validateSize;
    peekByte(): number;
    readByte(): number;
    readUInt8(): number;
    readInt8(): number;
    readUInt16BE(): number;
    readInt16BE(): number;
    readUInt24BE(): number;
    readInt24BE(): number;
    readUInt32BE(): number;
    readInt32BE(): number;
    readUInt48BE(): number;
    readInt48BE(): number;
    readBigUInt56BE(): bigint;
    readBigInt56BE(): bigint;
    readInt56BE(): number;
    readBigUInt64BE(): bigint;
    readBigInt64BE(): bigint;
    readFloatBE(): number;
    readDoubleBE(): number;
    readString(byteLength: number, encoding: ByteBufferEncoding): string;
    skip(byteLength: number): void;
}
//# sourceMappingURL=BufferedReader.d.ts.map