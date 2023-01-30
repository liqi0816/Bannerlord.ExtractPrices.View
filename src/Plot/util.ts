/**
 * create dummy points at edge of the map
 */
export function getBoundaryPoints(x: Float64Array, y: Float64Array, z: Uint32Array) {
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMin = Math.min(...y);
    const yMax = Math.max(...y);
    let zSum = 0;
    for (const v of z) {
        zSum += v;
    }
    return [
        { x: xMin - 0.1 * (xMax - xMin), y: yMin - 0.1 * (yMax - yMin), z: zSum / z.length },
        { x: xMin - 0.1 * (xMax - xMin), y: yMax + 0.1 * (yMax - yMin), z: zSum / z.length },
        { x: xMax + 0.1 * (xMax - xMin), y: yMin - 0.1 * (yMax - yMin), z: zSum / z.length },
        { x: xMax + 0.1 * (xMax - xMin), y: yMax + 0.1 * (yMax - yMin), z: zSum / z.length },
    ] as const;
}
