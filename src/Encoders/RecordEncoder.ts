import {TAGS} from "../Constants";
import {encodeString} from "./StringEncoder";
import {encodeUnknown} from "./UnknownEncoder";
import {ByteBuffer} from "../ByteBuffer";

export function encodeRecord(data: Record<string, unknown>): Buffer {
    const entries = Object.entries(data);
    const encoded: Buffer[] = [];

    for (const [key, value] of entries) {
        encoded.push(encodeString(key));
        encoded.push(encodeUnknown(value));
    }

    const content = Buffer.concat(encoded);
    const len = entries.length;

    if (len <= 0xff) {
        return Buffer.concat([
            Buffer.of(TAGS.REC8, len),
            content
        ]);
    }

    if (len <= 0xff_ff) {
        const header = ByteBuffer.alloc(3);

        header[0] = TAGS.REC16;
        header.writeUInt16BE(len, 1);

        return Buffer.concat([header, content]);
    }

    if (len <= 0xff_ff_ff) {
        const header = ByteBuffer.alloc(4);

        header[0] = TAGS.REC24;
        header.writeUInt24BE(len, 1);

        return Buffer.concat([header, content]);
    }

    if (len <= 0xff_ff_ff_ff) {
        const header = ByteBuffer.alloc(5);

        header[0] = TAGS.REC32;
        header.writeUInt32BE(len, 1);

        return Buffer.concat([header, content]);
    }

    throw new Error("Record too large");
}