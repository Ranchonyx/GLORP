import { ByteBufferStream } from "./ByteBuffer";
export declare class Decoder {
    private stream;
    private shapes;
    private strings;
    constructor(stream: ByteBufferStream);
    private rehydrateShape;
    private decodeNumber;
    private decodeString;
    private decodeBoolean;
    private decodeAbsence;
    private decodeArray;
    private decodeRecord;
    private decodeStringReference;
    private decodeShapeReference;
    private decodeDate;
    private decodeUnknown;
    Decode<T = unknown>(): T;
}
//# sourceMappingURL=Decoder.d.ts.map