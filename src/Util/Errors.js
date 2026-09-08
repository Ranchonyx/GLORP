export class InvalidArgumentEncodeError extends Error {
    constructor(argument) {
        super(`Encoding ${JSON.stringify(argument)} (${typeof argument} / ${String(Object.getPrototypeOf(argument))}) is not supported.`);
        Object.setPrototypeOf(this, InvalidArgumentEncodeError.prototype);
    }
}
export class InvalidArgumentRangeError extends Error {
    constructor(argument, max, min = 0) {
        super(`Unable to encode argument ${String(argument)} ` + `(${typeof argument}). Range is ${String(min)} - ${String(max)}`);
        Object.setPrototypeOf(this, InvalidArgumentRangeError.prototype);
    }
}
export class InvalidBytecodeDecodeError extends Error {
    constructor(targetType, bytecode) {
        super(`Unable to decode bytecode ${bytecode.toString("hex")} into type ${targetType}.`);
        Object.setPrototypeOf(this, InvalidBytecodeDecodeError.prototype);
    }
}
