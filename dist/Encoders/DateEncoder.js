import { TAGS } from "../Util/Constants.js";
import { ByteBuffer } from "../Util/ByteBuffer.js";
export function encodeDate(data) {
    const b = ByteBuffer.alloc(8);
    b[0] = TAGS.DATE;
    b.writeInt56BE(data.valueOf(), 1);
    return b;
}
//# sourceMappingURL=DateEncoder.js.map