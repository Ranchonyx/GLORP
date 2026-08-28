import {encodeUnknown} from "./Encoders/UnknownEncoder";

export class Encoder {
    public constructor() {
    }

    public Encode(data: unknown): Buffer {
        return encodeUnknown(data);
    }
}