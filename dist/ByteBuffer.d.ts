export declare class ByteBuffer extends Buffer {
    writeUInt24BE(value: number, offset?: number): number;
    writeInt24BE(value: number, offset?: number): number;
    readUInt24BE(offset?: number): number;
    readInt24BE(offset?: number): number;
    writeUInt48BE(value: number, offset?: number): number;
    writeInt48BE(value: number, offset?: number): number;
    readUInt48BE(offset?: number): number;
    readInt48BE(offset?: number): number;
    writeBigUInt56BE(value: bigint, offset?: number): number;
    writeBigInt56BE(value: bigint, offset?: number): number;
    readBigUInt56BE(offset?: number): bigint;
    readBigInt56BE(offset?: number): bigint;
    writeInt56BE(value: number, offset?: number): number;
    readInt56BE(offset?: number): number;
    subarray(start?: number, end?: number): ByteBuffer;
    private static promote;
    static fromBuffer(buffer: Buffer): ByteBuffer;
    static alloc(size: number): ByteBuffer;
}
export declare class ByteBufferStream {
    private offset;
    private readonly length;
    private readonly buffer;
    constructor(buf: Buffer);
    peekByte(): number;
    peekSlice(amount?: number): ByteBuffer;
    skip(amount: number): void;
    get eof(): boolean;
}
//# sourceMappingURL=ByteBuffer.d.ts.map