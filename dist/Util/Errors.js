export class InvalidArgumentEncodeError extends Error {
    constructor(argument) {
        super(`Encoding ${JSON.stringify(argument)} (${typeof argument} / ${Object.getPrototypeOf(argument)}) is not supported.`);
        Object.setPrototypeOf(this, InvalidArgumentEncodeError.prototype);
    }
}
export class InvalidArgumentRangeError extends Error {
    constructor(argument, max, min = 0) {
        super(`Unable to encode encode argument ${JSON.stringify(argument)} (${typeof argument} / ${Object.getPrototypeOf(argument)}). Range is ${min} - ${max}`);
        Object.setPrototypeOf(this, InvalidArgumentEncodeError.prototype);
    }
}
export class InvalidBytecodeDecodeError extends Error {
    constructor(targetType, bytecode) {
        super(`Unable to decode bytecode ${bytecode.toString("hex")} into type ${targetType}.`);
        Object.setPrototypeOf(this, InvalidBytecodeDecodeError.prototype);
    }
}
//# sourceMappingURL=Errors.js.map