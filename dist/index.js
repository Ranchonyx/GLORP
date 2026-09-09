import { BufferedEncoder } from "./Encoder.js";
import { BufferedDecoder } from "./Decoder.js";
import { BufferedWriter } from "./Util/BufferedWriter.js";
import { BufferedReader } from "./Util/BufferedReader.js";
import { ByteBuffer } from "./Util/ByteBuffer.js";
/**
 * The **`GLORP`** static class contains static methods for decoding values from and encoding values to the GLORP format
 * */
export class GLORP {
    static #writer = null;
    static #encoder = null;
    /**
     * @typeParam T - The expected return type. Not validated at runtime.
     * @param buffer - The **`GLORP`**-encoded data to decode.
     * */
    static decode(buffer) {
        return new BufferedDecoder(new BufferedReader(ByteBuffer.from(buffer))).Decode();
    }
    /**
     * Encodes a supported JavaScript value into the GLORP binary format.
     *
     * Encoded values include numbers, bigints, strings, booleans, null, undefined, arrays, plain objects and Date intances.
     * Functions, symbols, classes and instances of custom classes are not supported.
     * @param data - The JavaScript value to encode.
     * @param options - Optionally, an options object for the encoding process, see EncodeOptions
     * */
    static encode(data, options) {
        if (!this.#writer)
            this.#writer = new BufferedWriter(options?.initialBufferSize || 1024);
        if (!this.#encoder)
            this.#encoder = new BufferedEncoder(this.#writer);
        return this.#encoder.Encode(data);
    }
}
//# sourceMappingURL=index.js.map