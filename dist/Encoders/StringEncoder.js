import { TAGS } from "../Util/Constants.js";
import { ByteBuffer } from "../Util/ByteBuffer.js";
import { InvalidArgumentRangeError } from "../Util/Errors.js";
function buf(len) {
    return ByteBuffer.alloc(len);
}
function encodeUTF8String(utf8String, len) {
    if (len <= 0xff) {
        const m = buf(len + 2);
        m[0] = TAGS.STU8;
        m[1] = len;
        m.set(Buffer.from(utf8String, "utf8"), 2);
        return m;
    }
    if (len <= 0xff_ff) {
        const m = buf(len + 3);
        m[0] = TAGS.STU16;
        m.writeUInt16BE(len, 1);
        m.set(Buffer.from(utf8String, "utf8"), 3);
        return m;
    }
    if (len <= 0xff_ff_ff) {
        const m = buf(len + 4);
        m[0] = TAGS.STU24;
        m.writeUInt32BE(len, 1);
        m.set(Buffer.from(utf8String, "utf8"), 4);
        return m;
    }
    if (len <= 0xff_ff_ff_ff) {
        const m = buf(len + 5);
        m[0] = TAGS.STU32;
        m.writeUInt32BE(len, 1);
        m.set(Buffer.from(utf8String, "utf8"), 5);
        return m;
    }
    throw new InvalidArgumentRangeError(utf8String, 0xff_ff_ff_ff);
}
function encodeASCIIString(asciiString, len) {
    if (len <= 0xff) {
        const m = buf(len + 2);
        m[0] = TAGS.STA8;
        m[1] = len;
        m.set(Buffer.from(asciiString, "ascii"), 2);
        return m;
    }
    if (len <= 0xff_ff) {
        const m = buf(len + 3);
        m[0] = TAGS.STA16;
        m.writeUInt16BE(len, 1);
        m.set(Buffer.from(asciiString, "ascii"), 3);
        return m;
    }
    if (len <= 0xff_ff_ff) {
        const m = buf(len + 4);
        m[0] = TAGS.STA24;
        m.writeUInt24BE(len, 1);
        m.set(Buffer.from(asciiString, "ascii"), 4);
        return m;
    }
    if (len <= 0xff_ff_ff_ff) {
        const m = buf(len + 5);
        m[0] = TAGS.STA32;
        m.writeUInt32BE(len, 1);
        m.set(Buffer.from(asciiString, "ascii"), 5);
        return m;
    }
    throw new InvalidArgumentRangeError(asciiString, 0xff_ff_ff_ff);
}
export function encodeString(x) {
    const byteLength = Buffer.byteLength(x);
    if (x.length === byteLength)
        return encodeASCIIString(x, byteLength);
    return encodeUTF8String(x, byteLength);
}
//# sourceMappingURL=StringEncoder.js.map