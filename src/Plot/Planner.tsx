import { Typography } from '@mui/material';
import { Annotations } from 'plotly.js';
import React from 'react';
import Plot from 'react-plotly.js';
import { RootDrilling } from '../Root';
import { nonNull } from '../types';
import * as business from './business';

interface Props extends Pick<RootDrilling, 'towns' | 'items' | 'prices'> {
    width: number;
    height: number;
}

function chunk<T>(array: ArrayLike<T>, size: number) {
    const ret: T[][] = [];
    for (let i = 0; i < array.length; i++) {
        if ((ret.at(-1)?.length ?? size) >= size) {
            ret.push([]);
        }
        ret.at(-1)!.push(array[i]!);
    }
    return ret;
}

function getData(towns: Props['towns'], items: Props['items'], prices: Props['prices']) {
    const specialities = business.calcTownSpecialities(prices);
    const length = Object.keys(specialities).length;
    const x = new Float64Array(length + 4);
    const y = new Float64Array(length + 4);
    const z = new Uint32Array(length + 4);
    const annotations = new Array<Partial<Annotations>>(length);
    for (const [i, [id, { shortage, surplus, totalValue, totalValueInK }]] of Object.entries(specialities).entries()) {
        const town = nonNull(towns[id]);
        x[i] = town.x;
        y[i] = town.y;
        z[i] = totalValue;
        annotations[i] = {
            x: x[i],
            y: y[i],
            text: [
                `${town.name} ${totalValueInK}k`,
                shortage.length &&
                    `-:${chunk(shortage, 3)
                        .map(chunk => chunk.map(({ item }) => nonNull(items[item]).name))
                        .join('<br />')}`,
                surplus.length &&
                    `+:${chunk(surplus, 3)
                        .map(chunk => chunk.map(({ item }) => nonNull(items[item]).name))
                        .join('<br />')}`,
            ]
                .filter(Boolean)
                .join('<br />'),
            showarrow: false,
            font: { size: 16, color: 'black' },
            bgcolor: 'rgba(255,255,255,0.5)',
            hovertext: [
                ...shortage.map(({ item, bid }) => `${items[item]?.name}@${bid}`),
                ...surplus.map(({ item, ask, quantity }) => `${items[item]?.name}x${quantity}@${ask}`),
            ].join(','),
        };
    }
    const boundaryPointgs = business.getBoundaryPoints(x.subarray(0, length), y.subarray(0, length), z.subarray(0, length));
    for (const [i, v] of boundaryPointgs.entries()) {
        x[length + i] = v.x;
        y[length + i] = v.y;
        z[length + i] = v.z;
    }
    return { x, y, z, annotations } as const;
}

export const Planner: React.FC<Props> = ({ towns, items, prices, width, height }) => {
    const { x, y, z, annotations } = React.useMemo(() => getData(towns, items, prices), [towns, items, prices]);
    return (
        <>
            <Typography lineHeight={'16px'} marginBottom={'4px'}>
                Click on the map to create a route
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
                    annotations,
                    width,
                    height: height - 20,
                    xaxis: { visible: false },
                    yaxis: { visible: false },
                    margin: { b: 0, l: 0, r: 0, t: 0 },
                }}
            />
        </>
    );
};
