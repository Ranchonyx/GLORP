import {ByteBuffer} from "../Util/ByteBuffer.js";
import {TAGS} from "../Util/Constants.js";
import {InvalidBytecodeDecodeError} from "../Util/Errors.js";

export function decodeBoolean(buffer: ByteBuffer): { value: boolean, bytesRead: number } {
    const tag = buffer[0] as TAGS;
    const ret = (value: boolean, bytesRead: number) => {
        return {value, bytesRead}
    }

    switch (tag) {
        case TAGS.TRU:
            return ret(true, 1);
        case TAGS.FLS:
            return ret(false, 1);
    }

    throw new InvalidBytecodeDecodeError("boolean", buffer);
}