import {test} from "node:test";
import * as assert from "node:assert";
import {BufferedEncoder} from "../src/Encoder.js";
import {BufferedDecoder} from "../src/Decoder.js"
import {BufferedWriter} from "../src/Util/BufferedWriter.js";
import {BufferedReader} from "../src/Util/BufferedReader.js";
import {ByteBuffer} from "../src/Util/ByteBuffer.js";

function encode(value: unknown): Uint8Array {
    return new BufferedEncoder(new BufferedWriter(1024)).Encode(value);
}

function decode(buffer: Uint8Array): unknown {
    return new BufferedDecoder(new BufferedReader(ByteBuffer.from(buffer))).Decode();
}

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
    const encoded = encode(NaN);
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

test("Invalid objects", () => {
    class SomeClass {
    }

    class ParentClass {
    }

    class ChildClass extends ParentClass {
    }

    function normalFunction() {
    }

    async function asyncFunction() {
    }

    function* generatorFunction() {
        yield 1;
    }

    const customPrototype = {
        glorp: true
    };

    const invalidValues: [string, unknown][] = [
        ["class constructor", SomeClass],
        ["normal function", normalFunction],
        ["arrow function", () => {
        }],
        ["async function", asyncFunction],
        ["generator function", generatorFunction],

        ["class instance", new SomeClass()],
        ["inherited class instance", new ChildClass()],

        ["custom prototype", Object.create(customPrototype)],

        ["Map", new Map()],
        ["Set", new Set()],
        ["WeakMap", new WeakMap()],
        ["WeakSet", new WeakSet()],

        ["ArrayBuffer", new ArrayBuffer(8)],
        ["DataView", new DataView(new ArrayBuffer(8))],
        ["Uint8Array", new Uint8Array(8)],
        ["Uint16Array", new Uint16Array(8)],
        ["Uint32Array", new Uint32Array(8)],
        ["Int8Array", new Int8Array(8)],
        ["Int16Array", new Int16Array(8)],
        ["Int32Array", new Int32Array(8)],
        ["Float32Array", new Float32Array(8)],
        ["Float64Array", new Float64Array(8)],
        ["BigInt64Array", new BigInt64Array(8)],
        ["BigUint64Array", new BigUint64Array(8)],
        ["Buffer", Buffer.alloc(8)],

        ["RegExp", /glorp/],
        ["Error", new Error("glorp")],
        ["TypeError", new TypeError("glorp")],
        ["Promise", Promise.resolve("glorp")],
        ["URL", new URL("https://example.com")],

        ["boxed Number", new Number(42)],
        ["boxed String", new String("glorp")],
        ["boxed Boolean", new Boolean(true)],
        ["boxed BigInt", Object(42n)],
        ["boxed Symbol", Object(Symbol("glorp"))],

        ["Symbol", Symbol("glorp")]
    ];

    for (const [name, value] of invalidValues) {
        assert.throws(
            () => encode(value),
            `Expected ${name} to be rejected`
        );
    }
});

test("Valid plain objects", () => {
    assert.doesNotThrow(() => {
        encode({});
    });

    assert.doesNotThrow(() => {
        encode({
            foo: "bar",
            nested: {
                glorp: 42
            },
            array: [
                1, 2, 3
            ]
        });
    });

    assert.doesNotThrow(() => {
        encode(Object.create(null));
    });

    assert.doesNotThrow(() => {
        encode(new Date());
    });
});

test("Repeated record shapes", () => {
    const input = [
        {id: 1, name: "Anna", active: true},
        {id: 2, name: "Ben", active: false},
        {id: 3, name: "Chris", active: true}
    ];

    const encoded = encode(input);
    const decoded = decode(encoded);

    assert.deepStrictEqual(decoded, input);
});

test("Repeated nested record shapes", () => {
    const input = [
        {
            id: 1,
            address: {
                city: "Minden",
                zip: 32423
            }
        },
        {
            id: 2,
            address: {
                city: "Lübbecke",
                zip: 32312
            }
        },
        {
            id: 3,
            address: {
                city: "Herford",
                zip: 32052
            }
        }
    ];

    const encoded = encode(input);
    const decoded = decode(encoded);

    assert.deepStrictEqual(decoded, input);
});

test("Repeated strings", () => {
    const input = [
        "glorp",
        "glorp",
        "glorp",
        "different",
        "glorp"
    ];

    const encoded = encode(input);
    const decoded = decode(encoded);

    assert.deepStrictEqual(decoded, input);
});

test("DATE", () => {
    const expected = new Date("2026-08-28T13:37:42.123Z");
    expectRoundTrip(expected);
});