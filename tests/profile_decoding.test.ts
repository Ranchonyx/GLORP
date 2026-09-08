import {BufferedEncoder} from "../src/Encoder.js";
import {Decoder} from "../src/Decoder.js";
import {test} from "node:test";
import {ByteBufferStream} from "../src/Util/ByteBufferStream.js";
import {BufferedWriter} from "../src/Util/BufferedWriter";

type User = {
    userId: string;
    username: string;
    age: number;
    sex: "m" | "f" | "d";
    familyName: string;
    christianName: string;
};

const input: User[] = Array.from({length: 1_000}, (_, i) => ({
    userId: `usr-${i.toString().padStart(4, "0")}`,
    username: `user.${i}`,
    age: 18 + (i % 63),
    sex: (["m", "f", "d"] as const)[i % 3],
    familyName: [
        "Müller",
        "Schmidt",
        "Schneider",
        "Fischer",
        "Weber"
    ][i % 5],
    christianName: [
        "Anna",
        "Max",
        "Felix",
        "Lena",
        "Jonas"
    ][i % 5]
}));

function encode(value: unknown): Buffer {
    return new BufferedEncoder(new BufferedWriter()).Encode(value);
}

function decode(buffer: Buffer): unknown {
    return new Decoder(new ByteBufferStream(buffer)).Decode();
}

test("Profile GLORP decoding", () => {
    const encoded = encode(input);

    for (let i = 0; i < 100; i++)
        decode(encoded); // Warm-up

    for (let i = 0; i < 10_000; i++)
        decode(encoded);
});