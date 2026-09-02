import {Encoder} from "./Encoder";
import {Decoder} from "./Decoder";
import {ByteBufferStream} from "./ByteBuffer";
import {writeFileSync} from "node:fs";

function encode(value: unknown): Buffer {
    return new Encoder().Encode(value);
}

function decode(buffer: Buffer): unknown {
    return new Decoder(new ByteBufferStream(buffer)).Decode();
}


/*
function expectRoundTrip(expected: unknown) {
    const encoded = encode(expected);
    const actual = decode(encoded);

    assert.deepStrictEqual(actual, expected);
}

test("PI", () => {
    const expected = Infinity;

    const encoded = encode(expected);
    const actual = decode(encoded);

    assert.equal(actual, expected);
});

test("NI", () => {
    const expected = -Infinity;

    const encoded = encode(expected);
    const actual = decode(encoded);

    assert.equal(actual, expected);
});

test("NN", () => {
    const expected = NaN;

    const encoded = encode(expected);
    const actual = decode(encoded);

    assert.ok(Number.isNaN(actual));
});

test("PZ", () => {
    const expected = +0;

    const encoded = encode(expected);
    const actual = decode(encoded);

    assert.ok(Object.is(actual, expected));
});

test("NZ", () => {
    const expected = -0;

    const encoded = encode(expected);
    const actual = decode(encoded);

    assert.ok(Object.is(actual, expected));
});

test("U8", () => {
    const expected = 42;
    expectRoundTrip(expected);
});

test("U16", () => {
    const expected = 0x100;
    expectRoundTrip(expected);
});

test("U24", () => {
    const expected = 0x1_0000;
    expectRoundTrip(expected);
});

test("U32", () => {
    const expected = 0x1_000000;
    expectRoundTrip(expected);
});

test("U48", () => {
    const expected = 0x1_00000000;
    expectRoundTrip(expected);
});

test("UBI", () => {
    const expected = 0x1_000000000000n;
    expectRoundTrip(expected);
});

test("S8", () => {
    const expected = -42;
    expectRoundTrip(expected);
});

test("S16", () => {
    const expected = -0x81;
    expectRoundTrip(expected);
});

test("S24", () => {
    const expected = -0x8001;
    expectRoundTrip(expected);
});

test("S32", () => {
    const expected = -0x800001;
    expectRoundTrip(expected);
});

test("S48", () => {
    const expected = -0x80000001;
    expectRoundTrip(expected);
});

test("SBI", () => {
    const expected = -0x800000000001n;
    expectRoundTrip(expected);
});

test("F32", () => {
    const expected = 1.5;
    expectRoundTrip(expected);
});

test("F64", () => {
    const expected = 1.0000000000000002;
    expectRoundTrip(expected);
});

test("STA8", () => {
    const expected = "hello";
    expectRoundTrip(expected);
});

test("STA16", () => {
    const expected = "a".repeat(256);
    expectRoundTrip(expected);
});

test("STA24", () => {
    const expected = "a".repeat(65536);
    expectRoundTrip(expected);
});

test("STU8", () => {
    const expected = "Miau 🐈";
    expectRoundTrip(expected);
});

test("STU16", () => {
    const expected = "🐈".repeat(128);
    expectRoundTrip(expected);
});

test("TRU", () => {
    const expected = true;
    expectRoundTrip(expected);
});

test("FLS", () => {
    const expected = false;
    expectRoundTrip(expected);
});

test("ABS", () => {
    const expected = null;
    expectRoundTrip(expected);
});

test("ARR8", () => {
    const expected = [1, "miau", true, null];
    expectRoundTrip(expected);
});

test("ARR16", () => {
    const expected = new Array(256).fill(null);
    expectRoundTrip(expected);
});

test("REC8", () => {
    const expected = {
        miau: true,
        glorp: 123,
        murks: null
    };

    expectRoundTrip(expected);
});

test("REC16", () => {
    const expected = Object.fromEntries(
        Array.from(
            {length: 256},
            (_, i) => [`key${i}`, i]
        )
    );

    expectRoundTrip(expected);
});

test("DATE", () => {
    const expected = new Date("2026-08-28T13:37:42.123Z");
    expectRoundTrip(expected);
});*/

const user = {
    id: "u-4711",
    username: "fjanetzki",
    displayName: "Felix Janetzki",
    firstName: "Felix",
    lastName: "Janetzki",
    email: "felix@example.com",

    active: true,
    admin: false,

    roles: [
        "user",
        "developer"
    ],

    department: "IT",
    language: "de-DE",

    createdAt: new Date("2024-01-15T09:30:00Z"),
    lastLogin: new Date(),

    preferences: {
        theme: "dark",
        notifications: true
    }
};

const users = [
    "miau"
]

console.log(users);
const encoded = encode(users);
writeFileSync("object.JSON", JSON.stringify(users));
writeFileSync("object.glorp", encoded);

console.log(decode(encoded));
