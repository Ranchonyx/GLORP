import { ByteBuffer } from "./ByteBuffer.js";
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
//# sourceMappingURL=ByteBufferStream.d.ts.map