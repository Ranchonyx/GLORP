import { TAGS } from "../Util/Constants.js";
import { InvalidBytecodeDecodeError } from "../Util/Errors.js";
export function decodeBoolean(buffer) {
    const tag = buffer[0];
    const ret = (value, bytesRead) => {
        return { value, bytesRead };
    };
    switch (tag) {
        case TAGS.TRU:
            return ret(true, 1);
        case TAGS.FLS:
            return ret(false, 1);
    }
    throw new InvalidBytecodeDecodeError("boolean", buffer);
}
