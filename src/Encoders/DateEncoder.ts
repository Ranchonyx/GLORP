import {TAGS} from "../Constants";
import {ByteBuffer} from "../ByteBuffer";

export function encodeDate(data: Date): Buffer {
    const b = ByteBuffer.alloc(8);
    b[0] = TAGS.DATE;
    b.writeInt56BE(data.valueOf(), 1)

    return b;
}