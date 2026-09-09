import test from "node:test";
import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";
import {cpus} from "node:os";

import {GLORP} from "../dist/index.js";

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
    familyName: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber"][i % 5],
    christianName: ["Anna", "Max", "Felix", "Lena", "Jonas"][i % 5]
}));

function median(values: readonly number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
}

type BenchmarkCase = {
    name: string;
    run: () => void;
    check: () => void;
    samples: number[];
};

test("GLORP vs JSON benchmark", () => {
    const iterations = 1_000;
    const rounds = 7;
    const warmupIterations = 200;

    // Copy once so decoder input remains independent of writer reuse.
    const glorpBytes = GLORP.encode(users);
    const jsonString = JSON.stringify(users);
    const jsonBytes = Buffer.from(jsonString, "utf8");

    assert.deepStrictEqual(GLORP.decode(glorpBytes), users);
    assert.deepStrictEqual(JSON.parse(jsonString), users);
    assert.deepStrictEqual(
        JSON.parse(jsonBytes.toString("utf8")),
        users
    );

    let glorpEncoded: Uint8Array = glorpBytes;
    let jsonEncodedString = jsonString;
    let jsonEncodedBytes: Buffer = jsonBytes;

    let glorpDecoded: unknown;
    let jsonStringDecoded: unknown;
    let jsonBytesDecoded: unknown;

    const cases: BenchmarkCase[] = [
        {
            name: "GLORP encode",
            run: () => {
                glorpEncoded = GLORP.encode(users);
            },
            check: () => {
                assert.ok(
                    glorpEncoded.toString() === glorpBytes.toString(),
                    "GLORP encoded bytes changed"
                );
            },
            samples: []
        },
        {
            name: "JSON string encode",
            run: () => {
                jsonEncodedString = JSON.stringify(users);
            },
            check: () => {
                assert.strictEqual(jsonEncodedString, jsonString);
            },
            samples: []
        },
        {
            name: "JSON UTF-8 encode",
            run: () => {
                jsonEncodedBytes = Buffer.from(
                    JSON.stringify(users),
                    "utf8"
                );
            },
            check: () => {
                assert.deepStrictEqual(jsonEncodedBytes, jsonBytes);
            },
            samples: []
        },
        {
            name: "GLORP decode",
            run: () => {
                glorpDecoded = GLORP.decode(glorpBytes);
            },
            check: () => {
                assert.deepStrictEqual(glorpDecoded, users);
            },
            samples: []
        },
        {
            name: "JSON string decode",
            run: () => {
                jsonStringDecoded = JSON.parse(jsonString);
            },
            check: () => {
                assert.deepStrictEqual(jsonStringDecoded, users);
            },
            samples: []
        },
        {
            name: "JSON UTF-8 decode",
            run: () => {
                jsonBytesDecoded = JSON.parse(
                    jsonBytes.toString("utf8")
                );
            },
            check: () => {
                assert.deepStrictEqual(jsonBytesDecoded, users);
            },
            samples: []
        }
    ];

    for (let i = 0; i < warmupIterations; i++) {
        for (const benchmark of cases)
            benchmark.run();
    }

    for (const benchmark of cases)
        benchmark.check();

    for (let round = 0; round < rounds; round++) {
        // Rotate which operation runs first in each round.
        for (let position = 0; position < cases.length; position++) {
            const benchmark = cases[(position + round) % cases.length];

            const start = performance.now();

            for (let i = 0; i < iterations; i++)
                benchmark.run();

            const elapsed = performance.now() - start;
            benchmark.samples.push(elapsed / iterations);

            // Assertions and result inspection are outside the timer.
            benchmark.check();
        }
    }

    const measurements = cases.map(benchmark => ({
        name: benchmark.name,
        medianMs: median(benchmark.samples),
        minMs: Math.min(...benchmark.samples),
        maxMs: Math.max(...benchmark.samples),
        samplesMs: benchmark.samples
    }));

    const result = {
        environment: {
            node: process.version,
            v8: process.versions.v8,
            platform: process.platform,
            architecture: process.arch,
            cpu: cpus()[0]?.model ?? "unknown"
        },
        workload: {
            description:
                "1,000 synthetic users with identical record layouts " +
                "and repeated names; uncompressed output",
            users: users.length,
            iterationsPerRound: iterations,
            rounds,
            warmupIterations
        },
        size: {
            glorpBytes: glorpBytes.length,
            jsonUtf8Bytes: jsonBytes.length,
            savedPercent:
                (1 - glorpBytes.length / jsonBytes.length) * 100
        },
        measurements
    };

    console.log("\n--- GLORP vs JSON ---");
    console.log(result.environment);
    console.log(
        `\nGLORP: ${glorpBytes.length} bytes` +
        `\nJSON UTF-8: ${jsonBytes.length} bytes` +
        `\nSpace saved: ${result.size.savedPercent.toFixed(2)}%`
    );

    console.table(measurements.map(measurement => ({
        operation: measurement.name,
        "median ms/payload": measurement.medianMs.toFixed(4),
        "min ms/payload": measurement.minMs.toFixed(4),
        "max ms/payload": measurement.maxMs.toFixed(4),
        "payloads/s": (1_000 / measurement.medianMs).toFixed(1)
    })));

    console.log("\n--- BENCHMARK JSON ---");
    console.log(JSON.stringify(result, null, 2));
});