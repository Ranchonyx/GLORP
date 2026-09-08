import { ByteBufferStream } from "./Util/ByteBufferStream.js";
export declare class Decoder {
    private stream;
    private shapes;
    private stringData;
    constructor(stream: ByteBufferStream);
    private rehydrateShape;
    private decodeNumber;
    private decodeString;
    private decodeBoolean;
    private decodeAbsence;
    private decodeArray;
    private decodeRecord;
    private decodeStringDefinition;
    private decodeStringReference;
    private decodeShapeReference;
    private decodeDate;
    private decodeUnknown;
    Decode<T = unknown>(): T;
}
//# sourceMappingURL=Decoder.d.ts.map