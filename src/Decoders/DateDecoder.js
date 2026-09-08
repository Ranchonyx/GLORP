export function decodeDate(buffer) {
    const encodedEpoch = buffer.readInt56BE(1);
    return { value: new Date(encodedEpoch), bytesRead: 8 };
}
