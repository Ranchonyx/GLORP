import {GLORP} from "../dist/index.js";
import {test} from "node:test";
import assert from "node:assert/strict";

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

test("profile encoding", () => {
    //V8 warm laufen lassen
    for (let i = 0; i < 100; i++)
        GLORP.encode(input);

    let checksum = 0;
    const end = performance.now() + 10_000;

    while (performance.now() < end)
        checksum += GLORP.encode(input).length;

    assert.ok(checksum > 0);
});