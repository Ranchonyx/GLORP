import {ByteBuffer} from "./ByteBuffer.js";

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
            throw new Error("Unexpected end of stream.");
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