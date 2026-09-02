import { TAGS } from "../Constants";
export function encodeBoolean(data) {
    if (data)
        return Buffer.of(TAGS.TRU);
    return Buffer.of(TAGS.FLS);
}
//# sourceMappingURL=BooleanEncoder.js.map