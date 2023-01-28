import { Typography } from '@mui/material';
import type { Annotations } from 'plotly.js';
import React from 'react';
import Plot from 'react-plotly.js';
import { RootDrilling } from '../Root';
import { ItemId, nonNull } from '../types';
import * as business from './business';

interface Props extends Pick<RootDrilling, 'towns' | 'items' | 'prices'> {
    id: ItemId;
    width: number;
    height: number;
}

function getBoundaryPoints(x: Float64Array, y: Float64Array, z: Uint32Array) {
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

export const Contour: React.FC<Props> = ({ id, towns, items, prices, width, height }) => {
    const itemPrices = React.useMemo(() => prices.filter(({ item }) => item === id), [prices, id]);
    const item = nonNull(items[id]);
    const { x, y, z, annotations } = React.useMemo(() => {
        const x = new Float64Array(itemPrices.length + 4);
        const y = new Float64Array(itemPrices.length + 4);
        const z = new Uint32Array(itemPrices.length + 4);
        const annotations = new Array<Partial<Annotations>>(itemPrices.length);
        for (let i = 0; i < itemPrices.length; i++) {
            const price = itemPrices[i]!;
            const town = nonNull(towns[price.town]);
            x[i] = town.x;
            y[i] = town.y;
            z[i] = price.ask;
            annotations[i] = {
                x: x[i],
                y: y[i],
                text: `${town.name}@${z[i]}`,
                showarrow: false,
                font: { size: 16, color: 'black' },
                bgcolor: 'rgba(255,255,255,0.5)',
                hovertext: `Bid ${price.bid}/Ask ${price.ask}/Qty ${price.quantity}/Elasticity ${Math.round(
                    10000 * business.getPriceElasticityOfFulfilled(price)
                )}`,
            };
        }
        const boundaryPointgs = getBoundaryPoints(
            x.subarray(0, itemPrices.length),
            y.subarray(0, itemPrices.length),
            z.subarray(0, itemPrices.length)
        );
        for (let i = 0; i < boundaryPointgs.length; i++) {
            x[i + itemPrices.length] = boundaryPointgs[i]!.x;
            y[i + itemPrices.length] = boundaryPointgs[i]!.y;
            z[i + itemPrices.length] = boundaryPointgs[i]!.z;
        }
        return { x, y, z, annotations } as const;
    }, [itemPrices, towns]);
    return (
        <>
            <Typography lineHeight={'16px'} marginBottom={'4px'}>
                Price of {item.name} (MSRP {item.msrp})
            </Typography>
            <Plot
                data={[
                    {
                        x,
                        y,
                        z,
                        type: 'contour',
                        colorscale: 'Jet',
                        showscale: true,
                        autocontour: true,
                        zsmooth: 'best',
                        connectgaps: true,
                        contours: { coloring: 'heatmap' },
                    },
                ]}
                layout={{
                    width,
                    height: height - 20,
                    annotations,
                    xaxis: { visible: false },
                    yaxis: { visible: false },
                    margin: { b: 0, l: 0, r: 0, t: 0 },
                }}
            />
        </>
    );
};
