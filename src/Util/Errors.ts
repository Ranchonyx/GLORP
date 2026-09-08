export class InvalidArgumentEncodeError extends Error {
    public constructor(argument: unknown) {
        super(`Encoding ${JSON.stringify(argument)} (${typeof argument} / ${String(Object.getPrototypeOf(argument))}) is not supported.`);
        Object.setPrototypeOf(this, InvalidArgumentEncodeError.prototype);
    }
}

export class InvalidArgumentRangeError extends Error {
    public constructor(argument: unknown, max: number | bigint, min: number | bigint = 0) {
        super(`Unable to encode argument ${String(argument)} ` + `(${typeof argument}). Range is ${String(min)} - ${String(max)}`);
        Object.setPrototypeOf(this, InvalidArgumentRangeError.prototype);
    }
}

export class InvalidBytecodeDecodeError extends Error {
    public constructor(targetType: string, bytecode: number) {
        super(`Unable to decode bytecode 0x${bytecode.toString(16)} into type ${targetType}.`);
        Object.setPrototypeOf(this, InvalidBytecodeDecodeError.prototype);
    }
}