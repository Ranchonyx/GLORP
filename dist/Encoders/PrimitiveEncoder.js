import { encodeNumber } from "./NumberEncoder";
import { encodeString } from "./StringEncoder";
import { encodeBoolean } from "./BooleanEncoder";
import { encodeAbsence } from "./AbsenceEncoder";
export function isPrimitive(data) {
    switch (typeof data) {
        case "bigint":
        case "boolean":
        case "string":
        case "number":
        case "undefined":
            return true;
    }
    return data === null;
}
export function encodePrimitive(data) {
    if (typeof data === "number" || typeof data === "bigint")
        return encodeNumber(data);
    if (typeof data === "string")
        return encodeString(data);
    if (typeof data === "boolean")
        return encodeBoolean(data);
    if (typeof data === "undefined" || data === null)
        return encodeAbsence(data);
    throw new Error(`Unable to encode data ${data}!`);
}
//# sourceMappingURL=PrimitiveEncoder.js.map