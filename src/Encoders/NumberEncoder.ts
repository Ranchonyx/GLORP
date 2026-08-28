import {TAGS} from "../Constants";
import {ByteBuffer} from "../ByteBuffer";

function buf(len: number): ByteBuffer {
    return ByteBuffer.alloc(len);
}

function nsign(value: number | bigint): number {
    if (typeof value === "bigint")
        return value < 0n ? -1 : value > 0n ? 1 : 0;

    return Math.sign(value);
}

function encodeInteger(integer: number | bigint): Buffer {
    function encodePositiveInteger(positiveInteger: number | bigint) {
        if (typeof positiveInteger === "bigint") {
            const m = buf(9);
            m[0] = TAGS.UBI;
            m.writeBigUInt64BE(positiveInteger, 1);
            return m;
        }

        if (positiveInteger <= 0xff)
            return Buffer.from([TAGS.U8, positiveInteger]);

        if (positiveInteger <= 0xff_ff) {
            const m = buf(3);
            m[0] = TAGS.U16;
            m.writeUInt16BE(positiveInteger, 1);

            return m;
        }

        if (positiveInteger <= 0xff_ff_ff) {
            const m = buf(4);
            m[0] = TAGS.U24;
            m.writeUInt24BE(positiveInteger, 1);

            return m;
        }

        if (positiveInteger <= 0xff_ff_ff_ff) {
            const m = buf(5);
            m[0] = TAGS.U32;
            m.writeUInt32BE(positiveInteger, 1);
            return m;
        }

        if (positiveInteger <= 0xff_ff_ff_ff_ff_ff) {
            const m = buf(7);
            m[0] = TAGS.U48;
            m.writeUInt48BE(positiveInteger, 1);

            return m;
        }

        const m = buf(9);
        m[0] = TAGS.UBI;
        m.writeBigUInt64BE(BigInt(positiveInteger), 1);
        return m;
    }

    function encodeNegativeInteger(negativeInteger: number | bigint) {
        if (typeof negativeInteger === "bigint") {
            const m = buf(9);
            m[0] = TAGS.SBI;
            m.writeBigInt64BE(negativeInteger, 1);
            return m;
        }

        if (negativeInteger >= -0x80) {
            const m = buf(2);
            m[0] = TAGS.S8;
            m.writeInt8(negativeInteger, 1);
            return m;
        }

        if (negativeInteger >= -0x8000) {
            const m = buf(3);
            m[0] = TAGS.S16;
            m.writeInt16BE(negativeInteger, 1);
            return m;
        }

        if (negativeInteger >= -0x800000) {
            const m = buf(4);
            m[0] = TAGS.S24;
            m.writeInt24BE(negativeInteger, 1);
            return m;
        }

        if (negativeInteger >= -0x80000000) {
            const m = buf(5);
            m[0] = TAGS.S32;
            m.writeInt32BE(negativeInteger, 1);
            return m;
        }

        if (negativeInteger >= -0x800000000000) {
            const m = buf(7);
            m[0] = TAGS.S48;
            m.writeInt48BE(negativeInteger, 1);
            return m;
        }

        const m = buf(9);
        m[0] = TAGS.SBI;
        m.writeBigInt64BE(BigInt(negativeInteger), 1);
        return m;
    }

    const sign = nsign(integer);
    if (sign === 1)
        return encodePositiveInteger(integer);

    if (sign === -1)
        return encodeNegativeInteger(integer);

    throw new Error(`Unable to encode integer.`);
}

function encodeFloat(float: number): Buffer {
    //Wenn fround(64bit number) === 32 number, dann passt x in 32bits IEEE-754
    if (Math.fround(float) === float) {
        const buf = Buffer.alloc(5);
        buf[0] = TAGS.F32;
        buf.writeFloatBE(float, 1);
        return buf;
    }

    const buf = Buffer.alloc(9);
    buf[0] = TAGS.F64;
    buf.writeDoubleBE(float, 1);
    return buf;
}

export function encodeNumber(x: number | bigint): Buffer {
    if (typeof x === "bigint")
        return encodeInteger(x);

    //NaN behandeln
    if (Number.isNaN(x))
        return Buffer.from([TAGS.NN]);

    //Infinity
    if (x === Infinity)
        return Buffer.from([TAGS.PI]);

    //Negative infinity
    if (x === -Infinity)
        return Buffer.from([TAGS.NI]);

    //Muss Object.is nutzen weil in js 0 === -1 := true
    if (Object.is(x, -0))
        return Buffer.from([TAGS.NZ]);

    //Positive zero
    if (x === 0)
        return Buffer.from([TAGS.PZ]);

    //Wenn integral...
    if (Number.isInteger(x)) {

        //Wenn unsicher kabumm
        if (!Number.isSafeInteger(x))
            throw new Error(`Unsafe integer: ${x} cannot be encoded.`);

        //Integer kodieren
        return encodeInteger(x);
    }

    //Ab hier ist basically alles geprüft, ergo wird x ab hier nen float sein

    return encodeFloat(x);
}