import { BufferedEncoder } from "./Encoder.js";
import { BufferedDecoder } from "./Decoder.js";
import { BufferedWriter } from "./Util/BufferedWriter.js";
import { BufferedReader } from "./Util/BufferedReader.js";
import { ByteBuffer } from "./Util/ByteBuffer.js";
/**
 * The **`GLORP`** static class contains static methods for decoding values from and encoding values to the GLORP format
 * */
export class GLORP {
    static #encoder = new BufferedEncoder(new BufferedWriter());
    /**
     * @typeParam T - The expected return type. Not validated at runtime.
     * @param buffer - The **`GLORP`**-encoded data to decode.
     * */
    static decode(buffer) {
        return new BufferedDecoder(new BufferedReader(ByteBuffer.fromBuffer(buffer))).Decode();
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