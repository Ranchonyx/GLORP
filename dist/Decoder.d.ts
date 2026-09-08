import { BufferedReader } from "./Util/BufferedReader";
export declare class BufferedDecoder {
    private stream;
    private stringData;
    private shapeData;
    constructor(stream: BufferedReader);
    private rehydrateShape;
    private decodeNumber;
    private decodeString;
    private decodeBoolean;
    private decodeAbsence;
    private decodeArray;
    private decodeRecord;
    private decodeStringDefinition;
    private decodeStringReference;
    private decodeShapeDefinition;
    private decodeShapeReference;
    private decodeDate;
    private decodeUnknown;
    Decode<T = unknown>(): T;
}
//# sourceMappingURL=Decoder.d.ts.map