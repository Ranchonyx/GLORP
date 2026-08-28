import {ByteBuffer} from "../ByteBuffer";
import {TAGS} from "../Constants";

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

    throw new Error("Unable to decode boolean.");
}