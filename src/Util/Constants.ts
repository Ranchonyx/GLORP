export enum TAGS {
    PI = 0x00,              //positive infinity
    NI = 0x01,              //negative infinity
    NN = 0x02,              //not-a-number
    PZ = 0x03,              //positive 0
    NZ = 0x04,              //negative 0

    U8 = 0x05,              //unsigned 8-bit integer
    U16 = 0x06,             //unsigned 16-bit integer
    U24 = 0x07,             //unsigned 24-bit integer
    U32 = 0x08,             //unsigned 32-bit integer
    U48 = 0x09,             //unsigned 48-bit integer
    U56 = 0x0a,             //unsigned 56-bit integer
    UBI = 0x0b,             //unsigned big integer

    S8 = 0x0c,              //signed 8-bit integer
    S16 = 0x0d,             //signed 16-bit integer
    S24 = 0x0e,             //signed 24-bit integer
    S32 = 0x0f,             //signed 32-bit integer
    S48 = 0x10,             //signed 48-bit integer
    S56 = 0x11,             //signed 56-bit integer
    SBI = 0x12,             //signed big integer

    F32 = 0x13,             //IEEE-754 32-bit floating point
    F64 = 0x14,             //IEEE-754 64-bit floating point

    STA8 = 0x15,            //ASCII string, len <= 0xff
    STA16 = 0x16,           //ASCII string, len <= 0xffff
    STA24 = 0x17,           //ASCII string, len <= 0xffffff
    STA32 = 0x18,           //ASCII string, len <= 0xffffffff

    STU8 = 0x19,            //UTF-8 string, len <= 0xff
    STU16 = 0x1a,           //UTF-8 string, len <= 0xffff
    STU24 = 0x1b,           //UTF-8 string, len <= 0xffffff
    STU32 = 0x1c,           //UTF-8 string, len <= 0xffffffff

    TRU = 0x1d,             //Boolean value for true
    FLS = 0x1e,             //Boolean value for false
    ABS = 0x1f,             //Undefined or null

    ARR8 = 0x20,            //Array, len <= 0xff
    ARR16 = 0x21,           //Array, len <= 0xffff
    ARR24 = 0x22,           //Array, len <= 0xffffff
    ARR32 = 0x23,           //Array, len <= 0xffffffff

    REC8 = 0x24,            //Record<unknown, unknown>, keylen <= 0xff
    REC16 = 0x25,           //Record<unknown, unknown>, keylen <= 0xffff
    REC24 = 0x26,           //Record<unknown, unknown>, keylen <= 0xffffff
    REC32 = 0x27,           //Record<unknown, unknown>, keylen <= 0xffffffff

    DATE = 0x28,            //Date,

    SP_SHAPE_DEF = 0x29,    //Shape definition
    SP_SHAPE_REF = 0x2a,    //Reference to a shape
    SP_STRING_DEF = 0x2b,   //String definition
    SP_STRING_REF = 0x2c,   //Reference to a string
    SP_RUN = 0x2d           //Indicates a run of elements of the same type
}

export enum FlAGS {
    TAB_SHAPES = 1 << 0,
    TAB_STRINGS = 1 << 1
}

const GLORP_STRING = "glorp";
export const GLORP_MAGIC = GLORP_STRING.charCodeAt(0) |
    GLORP_STRING.charCodeAt(1) |
    GLORP_STRING.charCodeAt(2) |
    GLORP_STRING.charCodeAt(3) |
    GLORP_STRING.charCodeAt(4);

type ValueOrArray<T> = T | ValueOrArray<T>[];

export type ShapeNode = ValueOrArray<string>;
export type StringifiedShape = string & {};

export enum SymbolState {
    UNIQUE,
    DEFINED
}

export type ShapeEntry = {
    index?: number;
    state: SymbolState;
    keys: string[];
    encodedShape: StringifiedShape;
}