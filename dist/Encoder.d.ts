export declare class Encoder {
    private shapes;
    private shapeIndices;
    private strings;
    private stringIndices;
    private dehydrateToShape;
    constructor();
    private encodeArray;
    private encodeRecord;
    private encodeUnknown;
    private encodeShapeReference;
    private encodeStringReference;
    Encode(data: unknown): Buffer;
}
//# sourceMappingURL=Encoder.d.ts.map