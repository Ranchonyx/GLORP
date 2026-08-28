import {TAGS} from "../Constants";

export function encodeBoolean(data: boolean): Buffer {
    if(data)
        return Buffer.of(TAGS.TRU);

    return Buffer.of(TAGS.FLS);
}