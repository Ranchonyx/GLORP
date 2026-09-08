export declare class InvalidArgumentEncodeError extends Error {
    constructor(argument: unknown);
}
export declare class InvalidArgumentRangeError extends Error {
    constructor(argument: unknown, max: number | bigint, min?: number | bigint);
}
export declare class InvalidBytecodeDecodeError extends Error {
    constructor(targetType: string, bytecode: number);
}
//# sourceMappingURL=Errors.d.ts.map