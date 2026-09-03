import {ByteBuffer} from "../Util/ByteBuffer.js";
import {TAGS} from "../Util/Constants.js";
import {InvalidBytecodeDecodeError} from "../Util/Errors.js";

export function decodeString(buffer: ByteBuffer): { value: string, bytesRead: number } {
    const tag = buffer[0] as TAGS;
    const ret = (value: string, bytesRead: number) => {
        return {value, bytesRead}
    }

    switch (tag) {
        case TAGS.STA8:
            const len8a = buffer[1];
            return ret(buffer.subarray(2, 2 + len8a).toString("ascii"), len8a + 2);
        case TAGS.STA16:
            const len16a = buffer.readUInt16BE(1);
            return ret(buffer.subarray(3, 3 + len16a).toString("ascii"), len16a + 3);
        case TAGS.STA24:
            const len24a = buffer.readUInt24BE(1);
            return ret(buffer.subarray(4, 4 + len24a).toString("ascii"), len24a + 4);
        case TAGS.STA32:
            const len32a = buffer.readUInt32BE(1);
            return ret(buffer.subarray(5, 5 + len32a).toString("ascii"), len32a + 5);
        case TAGS.STU8:
            const len8u = buffer[1];
            return ret(buffer.subarray(2, 2 + len8u).toString("utf8"), len8u + 2);
        case TAGS.STU16:
            const len16u = buffer.readUInt16BE(1);
            return ret(buffer.subarray(3, 3 + len16u).toString("utf8"), len16u + 3);
        case TAGS.STU24:
            const len24u = buffer.readUInt24BE(1);
            return ret(buffer.subarray(4, 4 + len24u).toString("utf8"), len24u + 4);
        case TAGS.STU32:
            const len32u = buffer.readUInt32BE(1);
            return ret(buffer.subarray(5, 5 + len32u).toString("utf8"), len32u + 5);
    }

    throw new InvalidBytecodeDecodeError("string", buffer);
}