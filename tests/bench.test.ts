import test from "node:test";
import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";

import {GLORP} from "../src/index.js";

type User = {
    userId: string;
    username: string;
    age: number;
    sex: "m" | "f" | "d";
    familyName: string;
    christianName: string;
};

const users: User[] = Array.from({length: 1_000}, (_, i) => ({
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

test("GLORP vs JSON benchmark", () => {
    const iterations = 1_000;
    for (let i = 0; i < 100; i++) {
        const glorp = GLORP.encode(users);
        GLORP.decode<User[]>(glorp);

        const json = JSON.stringify(users);
        JSON.parse(json);
    }

    let glorpEncoded!: Buffer;

    const glorpEncodeStart = performance.now();

    for (let i = 0; i < iterations; i++)
        glorpEncoded = GLORP.encode(users);

    const glorpEncodeTime = performance.now() - glorpEncodeStart;

    let jsonEncoded!: string;

    const jsonEncodeStart = performance.now();

    for (let i = 0; i < iterations; i++) {
        jsonEncoded = JSON.stringify(users);
    }

    const jsonEncodeTime = performance.now() - jsonEncodeStart;

    let glorpDecoded!: User[];

    const glorpDecodeStart = performance.now();

    for (let i = 0; i < iterations; i++)
        glorpDecoded = GLORP.decode<User[]>(glorpEncoded);

    const glorpDecodeTime = performance.now() - glorpDecodeStart;

    let jsonDecoded!: User[];

    const jsonDecodeStart = performance.now();

    for (let i = 0; i < iterations; i++) {
        jsonDecoded = JSON.parse(jsonEncoded);
    }

    const jsonDecodeTime = performance.now() - jsonDecodeStart;


    const glorpSize = glorpEncoded.byteLength;
    const jsonSize = Buffer.byteLength(jsonEncoded, "utf8");

    const sizeRatio = glorpSize / jsonSize;
    const sizeSaving = (1 - sizeRatio) * 100;

    assert.deepStrictEqual(glorpDecoded, users);
    assert.deepStrictEqual(jsonDecoded, users);

    console.log(`
--- GLORP vs JSON ---

Payload:
  Users:              ${users.length.toLocaleString()}

Encoded size:
  GLORP:              ${glorpSize.toLocaleString()} bytes
  JSON:               ${jsonSize.toLocaleString()} bytes
  GLORP / JSON:       ${(sizeRatio * 100).toFixed(2)} %
  Space saved:        ${sizeSaving.toFixed(2)} %

Encoding:
  GLORP total:        ${glorpEncodeTime.toFixed(2)} ms
  JSON total:         ${jsonEncodeTime.toFixed(2)} ms
  GLORP avg:          ${(glorpEncodeTime / iterations).toFixed(4)} ms
  JSON avg:           ${(jsonEncodeTime / iterations).toFixed(4)} ms
  Ratio:              ${(glorpEncodeTime / jsonEncodeTime).toFixed(2)}x

Decoding:
  GLORP total:        ${glorpDecodeTime.toFixed(2)} ms
  JSON total:         ${jsonDecodeTime.toFixed(2)} ms
  GLORP avg:          ${(glorpDecodeTime / iterations).toFixed(4)} ms
  JSON avg:           ${(jsonDecodeTime / iterations).toFixed(4)} ms
  Ratio:              ${(glorpDecodeTime / jsonDecodeTime).toFixed(2)}x
`);
});