import { ByteBuffer } from "./ByteBuffer";
export declare class BufferedWriter {
    private buffer;
    private offset;
    constructor(initialSize?: number);
    private resizeTo;
    private ensureAtLeast;
    writeUInt24BE(value: number): number;
    writeInt24BE(value: number): number;
    readUInt24BE(offset?: number): number;
    readInt24BE(offset?: number): number;
    writeUInt48BE(value: number): number;
    writeInt48BE(value: number): number;
    readUInt48BE(offset?: number): number;
    readInt48BE(offset?: number): number;
    writeBigUInt56BE(value: bigint): number;
    writeBigInt56BE(value: bigint): number;
    readBigUInt56BE(offset?: number): bigint;
    readBigInt56BE(offset?: number): bigint;
    writeInt56BE(value: number): number;
    readInt56BE(offset?: number): number;
    writeUInt8(value: number): number;
    writeInt8(value: number): number;
    writeUInt16BE(value: number): number;
    writeInt16BE(value: number): number;
    writeUInt32BE(value: number): number;
    writeInt32BE(value: number): number;
    writeFloatBE(value: number): number;
    writeDoubleBE(value: number): number;
    writeBuffer(value: Buffer): number;
    writeByte(value: number): number;
    finish(): ByteBuffer;
}
//# sourceMappingURL=BufferedWriter.d.ts.map