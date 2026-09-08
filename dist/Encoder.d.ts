import { BufferedWriter } from "./Util/BufferedWriter";
export declare class BufferedEncoder {
    private writer;
    private stringData;
    private shapeEntries;
    private lastShapeEntry;
    private nextShapeIndex;
    private dehydrateToShape;
    private encodeUTF8String;
    private encodeASCIIString;
    private encodeStringUTFOrASCII;
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
    private matchesShape;
    private findShapeEntry;
    private encodeObject;
    private encodeString;
    private encodeUnknown;
    private encodeShapeValues;
    private encodeShapeDefinition;
    private encodeShapeReference;
    private encodeStringDefinition;
    private encodeStringReference;
    constructor(writer: BufferedWriter);
    Encode(data: unknown): Buffer;
}
//# sourceMappingURL=Encoder.d.ts.map