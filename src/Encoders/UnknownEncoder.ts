import {encodePrimitive, isPrimitive} from "./PrimitiveEncoder";
import {encodeArray} from "./ArrayEncoder";
import {encodeDate} from "./DateEncoder";
import {encodeRecord} from "./RecordEncoder";

export function encodeUnknown(data: unknown): Buffer {
    //Check if we need to encode a primitive first
    if (isPrimitive(data))
        return encodePrimitive(data);

    if (Object.getPrototypeOf(data) === Date.prototype)
        return encodeDate(data as Date);

    //If we're dealing with an array
    if (Array.isArray(data))
        return encodeArray(data)

    if(typeof data === "object")
        return encodeRecord(data as Record<string, unknown>);
    throw new Error("Unable to encode");
}