import { Encoder } from "./Encoder";
import { Decoder } from "./Decoder";
import { ByteBufferStream } from "./ByteBuffer";
/**
 * The **`GLORP`** static class contains static methods for decoding values from and encoding values to the GLORP format
 * */
export class GLORP {
    static #encoder = new Encoder();
    /**
     * @typeParam T - The expected return type. Not validated at runtime.
     * @param buffer - The **`GLORP`**-encoded data to decode.
     * */
    static decode(buffer) {
        return new Decoder(new ByteBufferStream(buffer)).Decode();
    }
    /**
     * Encodes a supported JavaScript value into the GLORP binary format.
     *
     * Encoded values include numbers, bigints, strings, booleans, null, undefined, arrays, plain objects and Date intances.
     * Functions, symbols, classes and instances of custom classes are not supported.
     * @param data - The JavaScript value to encode.
     * */
    static encode(data) {
        return this.#encoder.Encode(data);
    }
}
//# sourceMappingURL=index.js.map