import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import type { Annotations } from 'plotly.js';
import React from 'react';
import Plot from 'react-plotly.js';
import * as business from '../business';
import { RootDrilling } from '../Root';
import { ItemId, nonNull } from '../types';
import * as util from './util';

interface Props extends Pick<RootDrilling, 'towns' | 'items' | 'prices'> {
    width: number;
    height: number;
    id: ItemId;
}

function getData(itemPrices: Props['prices'], towns: Props['towns']) {
    const x = new Float64Array(itemPrices.length + 4);
    const y = new Float64Array(itemPrices.length + 4);
    const z = new Uint32Array(itemPrices.length + 4);
    const annotations = new Array<Partial<Annotations>>(itemPrices.length);
    for (const [i, price] of itemPrices.entries()) {
        const town = nonNull(towns[price.town]);
        x[i] = town.x;
        y[i] = town.y;
        z[i] = price.ask;
        annotations[i] = {
            x: x[i],
            y: y[i],
            text: [town.name, `x${price.quantity}@${price.ask}`].join('<br />'),
            showarrow: false,
            font: { size: 16, color: 'black' },
            bgcolor: 'rgba(255,255,255,0.5)',
            hovertext: `Bid ${price.bid}/Ask ${price.ask}/Qty ${price.quantity}/Elasticity ${Math.round(
                10000 * business.getPriceElasticity(price)
            )}`,
        };
    }
    const boundaryPointgs = util.getBoundaryPoints(
        x.subarray(0, itemPrices.length),
        y.subarray(0, itemPrices.length),
        z.subarray(0, itemPrices.length)
    );
    for (const [i, v] of boundaryPointgs.entries()) {
        x[itemPrices.length + i] = v.x;
        y[itemPrices.length + i] = v.y;
        z[itemPrices.length + i] = v.z;
    }
    return { x, y, z, annotations } as const;
}

export const Contour: React.FC<Props> = ({ id, towns, items, prices, width, height }) => {
    const itemPrices = React.useMemo(() => prices.filter(({ item }) => item === id), [prices, id]);
    const { x, y, z, annotations } = React.useMemo(() => getData(itemPrices, towns), [itemPrices, towns]);
    const item = nonNull(items[id]);
    return (
        <>
            <Typography lineHeight={'16px'} marginBottom={'4px'}>
                <Trans>
                    Price of {item.name} (MSRP {item.msrp})
                </Trans>
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
