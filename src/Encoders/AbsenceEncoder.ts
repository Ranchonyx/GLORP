import {TAGS} from "../Constants";

export function encodeAbsence(_data: undefined | null) {
    return Buffer.of(TAGS.ABS);
}