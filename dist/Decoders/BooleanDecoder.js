import { TAGS } from "../Constants";
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
    throw new Error("Unable to decode boolean.");
}
//# sourceMappingURL=BooleanDecoder.js.map