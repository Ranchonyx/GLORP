export declare enum TAGS {
    PI = 0,//positive infinity
    NI = 1,//negative infinity
    NN = 2,//not-a-number
    PZ = 3,//positive 0
    NZ = 4,//negative 0
    U8 = 5,//unsigned 8-bit integer
    U16 = 6,//unsigned 16-bit integer
    U24 = 7,//unsigned 24-bit integer
    U32 = 8,//unsigned 32-bit integer
    U48 = 9,//unsigned 48-bit integer
    U56 = 10,//unsigned 56-bit integer
    UBI = 11,//unsigned big integer
    S8 = 12,//signed 8-bit integer
    S16 = 13,//signed 16-bit integer
    S24 = 14,//signed 24-bit integer
    S32 = 15,//signed 32-bit integer
    S48 = 16,//signed 48-bit integer
    S56 = 17,//signed 56-bit integer
    SBI = 18,//signed big integer
    F32 = 19,//IEEE-754 32-bit floating point
    F64 = 20,//IEEE-754 64-bit floating point
    STA8 = 21,//ASCII string, len <= 0xff
    STA16 = 22,//ASCII string, len <= 0xffff
    STA24 = 23,//ASCII string, len <= 0xffffff
    STA32 = 24,//ASCII string, len <= 0xffffffff
    STU8 = 25,//UTF-8 string, len <= 0xff
    STU16 = 26,//UTF-8 string, len <= 0xffff
    STU24 = 27,//UTF-8 string, len <= 0xffffff
    STU32 = 28,//UTF-8 string, len <= 0xffffffff
    TRU = 29,//Boolean value for true
    FLS = 30,//Boolean value for false
    ABS = 31,//Undefined or null
    ARR8 = 32,//Array, len <= 0xff
    ARR16 = 33,//Array, len <= 0xffff
    ARR24 = 34,//Array, len <= 0xffffff
    ARR32 = 35,//Array, len <= 0xffffffff
    REC8 = 36,//Record<unknown, unknown>, keylen <= 0xff
    REC16 = 37,//Record<unknown, unknown>, keylen <= 0xffff
    REC24 = 38,//Record<unknown, unknown>, keylen <= 0xffffff
    REC32 = 39,//Record<unknown, unknown>, keylen <= 0xffffffff
    DATE = 40,//Date,
    SP_SHAPE_DEF = 41,//Shape definition
    SP_SHAPE_REF = 42,//Reference to a shape
    SP_STRING_DEF = 43,//String definition
    SP_STRING_REF = 44,//Reference to a string
    SP_RUN = 45
}
export declare enum FlAGS {
    TAB_SHAPES = 1,
    TAB_STRINGS = 2
}
export declare const GLORP_MAGIC: number;
type ValueOrArray<T> = T | ValueOrArray<T>[];
export type ShapeNode = ValueOrArray<string>;
export type StringifiedShape = string & {};
export declare enum SymbolState {
    UNIQUE = 0,
    DEFINED = 1
}
export type ShapeEntry = {
    index?: number;
    state: SymbolState;
    keys: string[];
    encodedShape: StringifiedShape;
};
export {};
//# sourceMappingURL=Constants.d.ts.map