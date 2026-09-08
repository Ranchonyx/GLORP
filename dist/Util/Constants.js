export var TAGS;
(function (TAGS) {
    TAGS[TAGS["PI"] = 0] = "PI";
    TAGS[TAGS["NI"] = 1] = "NI";
    TAGS[TAGS["NN"] = 2] = "NN";
    TAGS[TAGS["PZ"] = 3] = "PZ";
    TAGS[TAGS["NZ"] = 4] = "NZ";
    TAGS[TAGS["U8"] = 5] = "U8";
    TAGS[TAGS["U16"] = 6] = "U16";
    TAGS[TAGS["U24"] = 7] = "U24";
    TAGS[TAGS["U32"] = 8] = "U32";
    TAGS[TAGS["U48"] = 9] = "U48";
    TAGS[TAGS["U56"] = 10] = "U56";
    TAGS[TAGS["UBI"] = 11] = "UBI";
    TAGS[TAGS["S8"] = 12] = "S8";
    TAGS[TAGS["S16"] = 13] = "S16";
    TAGS[TAGS["S24"] = 14] = "S24";
    TAGS[TAGS["S32"] = 15] = "S32";
    TAGS[TAGS["S48"] = 16] = "S48";
    TAGS[TAGS["S56"] = 17] = "S56";
    TAGS[TAGS["SBI"] = 18] = "SBI";
    TAGS[TAGS["F32"] = 19] = "F32";
    TAGS[TAGS["F64"] = 20] = "F64";
    TAGS[TAGS["STA8"] = 21] = "STA8";
    TAGS[TAGS["STA16"] = 22] = "STA16";
    TAGS[TAGS["STA24"] = 23] = "STA24";
    TAGS[TAGS["STA32"] = 24] = "STA32";
    TAGS[TAGS["STU8"] = 25] = "STU8";
    TAGS[TAGS["STU16"] = 26] = "STU16";
    TAGS[TAGS["STU24"] = 27] = "STU24";
    TAGS[TAGS["STU32"] = 28] = "STU32";
    TAGS[TAGS["TRU"] = 29] = "TRU";
    TAGS[TAGS["FLS"] = 30] = "FLS";
    TAGS[TAGS["ABS"] = 31] = "ABS";
    TAGS[TAGS["ARR8"] = 32] = "ARR8";
    TAGS[TAGS["ARR16"] = 33] = "ARR16";
    TAGS[TAGS["ARR24"] = 34] = "ARR24";
    TAGS[TAGS["ARR32"] = 35] = "ARR32";
    TAGS[TAGS["REC8"] = 36] = "REC8";
    TAGS[TAGS["REC16"] = 37] = "REC16";
    TAGS[TAGS["REC24"] = 38] = "REC24";
    TAGS[TAGS["REC32"] = 39] = "REC32";
    TAGS[TAGS["DATE"] = 40] = "DATE";
    TAGS[TAGS["SP_SHAPE_DEF"] = 41] = "SP_SHAPE_DEF";
    TAGS[TAGS["SP_SHAPE_REF"] = 42] = "SP_SHAPE_REF";
    TAGS[TAGS["SP_STRING_DEF"] = 43] = "SP_STRING_DEF";
    TAGS[TAGS["SP_STRING_REF"] = 44] = "SP_STRING_REF";
    TAGS[TAGS["SP_RUN"] = 45] = "SP_RUN"; //Indicates a run of elements of the same type
})(TAGS || (TAGS = {}));
export var FlAGS;
(function (FlAGS) {
    FlAGS[FlAGS["TAB_SHAPES"] = 1] = "TAB_SHAPES";
    FlAGS[FlAGS["TAB_STRINGS"] = 2] = "TAB_STRINGS";
})(FlAGS || (FlAGS = {}));
const GLORP_STRING = "glorp";
export const GLORP_MAGIC = GLORP_STRING.charCodeAt(0) |
    GLORP_STRING.charCodeAt(1) |
    GLORP_STRING.charCodeAt(2) |
    GLORP_STRING.charCodeAt(3) |
    GLORP_STRING.charCodeAt(4);
export var SymbolState;
(function (SymbolState) {
    SymbolState[SymbolState["UNIQUE"] = 0] = "UNIQUE";
    SymbolState[SymbolState["DEFINED"] = 1] = "DEFINED";
})(SymbolState || (SymbolState = {}));
//# sourceMappingURL=Constants.js.map