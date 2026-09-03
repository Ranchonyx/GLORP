import { ByteBuffer } from "./ByteBuffer.js";
export class ByteBufferStream {
    offset = 0;
    length;
    buffer;
    constructor(buf) {
        this.buffer = ByteBuffer.fromBuffer(buf);
        this.length = buf.byteLength;
    }
    peekByte() {
        if (this.eof) {
            throw new Error("Unexpected end of stream.");
        }
        return this.buffer[this.offset];
    }
    peekSlice(amount = 0xffffffff) {
        return this.buffer.subarray(this.offset, this.offset + amount);
    }
    skip(amount) {
        this.offset += amount;
    }
    get eof() {
        return this.offset >= this.length;
    }
}
//# sourceMappingURL=ByteBufferStream.js.map