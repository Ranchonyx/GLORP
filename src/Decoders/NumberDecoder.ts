import {ByteBuffer} from "../Util/ByteBuffer.js";
import {TAGS} from "../Util/Constants.js";
import {InvalidBytecodeDecodeError} from "../Util/Errors.js";

export function decodeNumber(buffer: ByteBuffer): { value: number | bigint, bytesRead: number } {
    const tag = buffer[0] as TAGS;
    const ret = (value: number | bigint, bytesRead: number) => {
        return {value, bytesRead}
    }

    switch (tag) {
        case TAGS.PI:
            return ret(+Infinity, 1);
        case TAGS.NI:
            return ret(-Infinity, 1);
        case TAGS.NN:
            return ret(NaN, 1);
        case TAGS.PZ:
            return ret(+0, 1);
        case TAGS.NZ:
            return ret(-0, 1);

        case TAGS.U8:
            return ret(buffer.readUInt8(1), 2);
        case TAGS.U16:
            return ret(buffer.readUInt16BE(1), 3);
        case TAGS.U24:
            return ret(buffer.readUInt24BE(1), 4);
        case TAGS.U32:
            return ret(buffer.readUInt32BE(1), 5);
        case TAGS.U48:
            return ret(buffer.readUInt48BE(1), 7);
        case TAGS.U56:
            return ret(buffer.readBigUInt56BE(1), 8);
        case TAGS.UBI:
            return ret(buffer.readBigUInt64BE(1), 9);

        case TAGS.S8:
            return ret(buffer.readInt8(1), 2);
        case TAGS.S16:
            return ret(buffer.readInt16BE(1), 3);
        case TAGS.S24:
            return ret(buffer.readInt24BE(1), 4);
        case TAGS.S32:
            return ret(buffer.readInt32BE(1), 5);
        case TAGS.S48:
            return ret(buffer.readInt48BE(1), 7);
        case TAGS.S56:
            return ret(buffer.readInt56BE(1), 8);
        case TAGS.SBI:
            return ret(buffer.readBigInt64BE(1), 9);

        case TAGS.F32:
            return ret(buffer.readFloatBE(1), 5);
        case TAGS.F64:
            return ret(buffer.readDoubleBE(1), 9);
    }

    throw new InvalidBytecodeDecodeError(`number | bigint`, buffer);
}