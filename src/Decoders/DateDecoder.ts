import {ByteBuffer} from "../Util/ByteBuffer.js";

export function decodeDate(buffer: ByteBuffer) {
    const encodedEpoch = buffer.readInt56BE(1);
    return {value: new Date(encodedEpoch), bytesRead: 8};
}