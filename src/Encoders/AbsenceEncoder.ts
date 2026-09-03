import {TAGS} from "../Util/Constants.js";

export function encodeAbsence(_data: undefined | null) {
    return Buffer.of(TAGS.ABS);
}