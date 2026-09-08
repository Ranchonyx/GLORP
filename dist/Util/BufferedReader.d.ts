import { ByteBuffer } from "./ByteBuffer.js";
export declare class BufferedReader {
    private readonly buffer;
    private offset;
    constructor(buffer: ByteBuffer);
    get position(): number;
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
    readString(byteLength: number, encoding: BufferEncoding): string;
    skip(byteLength: number): void;
    reset(): void;
}
//# sourceMappingURL=BufferedReader.d.ts.map