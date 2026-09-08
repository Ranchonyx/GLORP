import {BufferedEncoder} from "./Encoder.js";
import {Decoder} from "./Decoder.js";
import {ByteBufferStream} from "./Util/ByteBufferStream.js";
import {BufferedWriter} from "./Util/BufferedWriter.js";

/**
 * The **`GLORP`** static class contains static methods for decoding values from and encoding values to the GLORP format
 * */
export class GLORP {
    static #writer = new BufferedWriter();
    static #encoder = new BufferedEncoder(this.#writer);

    /**
     * @typeParam T - The expected return type. Not validated at runtime.
     * @param buffer - The **`GLORP`**-encoded data to decode.
     * */
    public static decode<T = unknown>(buffer: Buffer): T {
        return new Decoder(new ByteBufferStream(buffer)).Decode<T>();
    }

    /**
     * Encodes a supported JavaScript value into the GLORP binary format.
     *
     * Encoded values include numbers, bigints, strings, booleans, null, undefined, arrays, plain objects and Date intances.
     * Functions, symbols, classes and instances of custom classes are not supported.
     * @param data - The JavaScript value to encode.
     * */
    public static encode(data: unknown): Buffer {
        const result = this.#encoder.Encode(data);
        this.#writer.reset();

        return result;
    }
}