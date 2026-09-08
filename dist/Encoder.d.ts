import { BufferedWriter } from "./Util/BufferedWriter";
export declare class BufferedEncoder {
    private writer;
    private shapes;
    private shapeIndices;
    private stringData;
    private dehydrateToShape;
    private encodeUTF8String;
    private encodeASCIIString;
    private encodeString;
    private encodeBoolean;
    private encodeAbsence;
    private _sign;
    private encodeInteger;
    private encodeFloat;
    private encodeNumber;
    private isPrimitive;
    private encodePrimitive;
    private encodeDate;
    private encodeArray;
    private encodeRecord;
    private encodeUnknown;
    private encodeShapeReference;
    private encodeStringDefinition;
    private encodeStringReference;
    constructor(writer: BufferedWriter);
    Encode(data: unknown): Buffer;
}
//# sourceMappingURL=Encoder.d.ts.map