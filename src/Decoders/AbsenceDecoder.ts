import {ByteBuffer} from "../Util/ByteBuffer.js";

export function decodeAbsence(_buffer: ByteBuffer) {
    return {value: null, bytesRead: 1};
}