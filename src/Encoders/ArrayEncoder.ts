import {encodeUnknown} from "./UnknownEncoder";
import {TAGS} from "../Constants";
import {ByteBuffer} from "../ByteBuffer";

function buf(len: number): ByteBuffer {
    return ByteBuffer.alloc(len);
}

export function encodeArray(array: unknown[]): Buffer {
    const elements: Buffer[] = [];

    for (const element of array) {
        elements.push(encodeUnknown(element));
    }

    const elementsBuffer = Buffer.concat(elements);

    const count = array.length;
    const contentLength = elementsBuffer.byteLength;

    if (count <= 0xff) {
        const m = buf(contentLength + 2);

        m[0] = TAGS.ARR8;
        m[1] = count;
        m.set(elementsBuffer, 2);

        return m;
    }

    if (count <= 0xff_ff) {
        const m = buf(contentLength + 3);

        m[0] = TAGS.ARR16;
        m.writeUInt16BE(count, 1);
        m.set(elementsBuffer, 3);

        return m;
    }

    if (count <= 0xff_ff_ff) {
        const m = buf(contentLength + 4);

        m[0] = TAGS.ARR24;
        m.writeUInt24BE(count, 1);
        m.set(elementsBuffer, 4);

        return m;
    }

    if (count <= 0xff_ff_ff_ff) {
        const m = buf(contentLength + 5);

        m[0] = TAGS.ARR32;
        m.writeUInt32BE(count, 1);
        m.set(elementsBuffer, 5);

        return m;
    }

    throw new Error("Unable to encode array");
}