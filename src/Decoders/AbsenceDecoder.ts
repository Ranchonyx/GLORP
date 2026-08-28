import {ByteBuffer} from "../ByteBuffer";

export function decodeAbsence(_buffer: ByteBuffer) {
    return {value: null, bytesRead: 1};
}