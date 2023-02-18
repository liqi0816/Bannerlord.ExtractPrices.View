import { t, Trans } from '@lingui/macro';
import { Stack, TextField, Typography } from '@mui/material';
import { Annotations } from 'plotly.js';
import React from 'react';
import { createPortal } from 'react-dom';
import * as business from '../business';
import { RootDrilling } from '../Root';
import { nonNull } from '../types';
import Plot from './LazyPlot';
import * as util from './util';

interface Props extends Pick<RootDrilling, 'towns' | 'items' | 'prices'> {
    width: number;
    height: number;
    portal: React.MutableRefObject<HTMLDivElement | undefined>;
}

function* split(str: unknown, size: number = 30) {
    if (!str || typeof str !== 'string') return;
    for (let i = 0; i < str.length; i += size) {
        yield str.slice(i, i + size);
    }
}

function getData(towns: Props['towns'], items: Props['items'], prices: Props['prices']) {
    const specialities = Object.entries(business.calcTownSpecialities(prices));
    const length = specialities.length;
    const x = new Float64Array(length + 4);
    const y = new Float64Array(length + 4);
    const z = new Uint32Array(length + 4);
    const annotations = new Array<Partial<Annotations>>(length);
    for (const [i, [id, { shortage, surplus, totalValue, totalValueInK }]] of specialities.entries()) {
        const town = nonNull(towns[id]);
        x[i] = town.x;
        y[i] = town.y;
        z[i] = totalValue;
        annotations[i] = {
            x: x[i],
            y: y[i],
            text: [
                `${town.name} ${totalValueInK}k`,
                ...split(shortage.length && `-:${shortage.map(({ item }) => nonNull(items[item]).name)}`),
                ...split(surplus.length && `+:${surplus.map(({ item }) => nonNull(items[item]).name)}`),
            ].join('<br />'),
            showarrow: false,
            font: { size: 16, color: 'black' },
            bgcolor: 'rgba(255,255,255,0.5)',
            hovertext: [
                ...shortage.map(({ item, bid }) => `${items[item]?.name}@${bid}`),
                ...surplus.map(({ item, ask, quantity }) => `${items[item]?.name}x${quantity}@${ask}`),
            ].join(','),
        };
    }
    const boundaryPointgs = util.getBoundaryPoints(x.subarray(0, length), y.subarray(0, length), z.subarray(0, length));
    for (const [i, v] of boundaryPointgs.entries()) {
        x[length + i] = v.x;
        y[length + i] = v.y;
        z[length + i] = v.z;
    }
    return { x, y, z, annotations, specialities } as const;
}

function useSyncHashableObject<T>(object: T, calcHash: (object: T) => unknown) {
    const [, setHash] = React.useState<unknown>(() => calcHash(object));
    const ref = React.useRef<typeof calcHash>();
    ref.current = calcHash;
    return React.useCallback((object: T) => setHash(ref.current?.(object)), []);
}

interface PlannerRouteInformationProps extends Pick<RootDrilling, 'towns' | 'items'> {
    route: business.TradeRoute;
    setRoute: React.Dispatch<React.SetStateAction<PlannerRouteInformationProps['route']>>;
    capacity: number;
    setCapacity: React.Dispatch<React.SetStateAction<PlannerRouteInformationProps['capacity']>>;
}

const RouteControl: React.FC<PlannerRouteInformationProps> = ({ towns, items, route, setRoute, capacity, setCapacity }) => {
    const ref = React.useRef<HTMLElement>();
    React.useEffect(() => void ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), []);
    return (
        <Stack direction={'column'} gap={0.25} minHeight={'50vh'} marginTop={2} ref={ref}>
            <TextField
                label={t`Capacity`}
                variant={'outlined'}
                type={'number'}
                value={capacity}
                inputProps={{ step: 100 }}
                onChange={({ target }) => setCapacity(Number(target.value))}
            />
            {route.waypoints.length === 0 && (
                <Typography color={'primary.main'}>
                    <Trans>Click on a town to add a waypoint</Trans>
                </Typography>
            )}
            {route.waypoints.map(({ inventoryBeforeTrade, marketBeforeTrade, town }, key) => (
                <>
                    <Typography key={`${key}.inventoryBeforeTrade`} color={'secondary.main'}>
                        <Trans>
                            {'Inventory: '}
                            {inventoryBeforeTrade
                                .map(({ item, quantity }) => `${nonNull(items[item]).name}x${quantity}`)
                                .join(',')}
                        </Trans>
                    </Typography>
                    <Typography key={`${key}.town`} color={'primary.main'}>
                        <Trans>
                            To: {nonNull(towns[town]).name} {'profit '}
                            {business.calcProfitAtMarket(marketBeforeTrade, inventoryBeforeTrade)}
                        </Trans>
                    </Typography>
                </>
            ))}
        </Stack>
    );
};

export const Planner: React.FC<Props> = ({ towns, items, prices, width, height, portal }) => {
    const { x, y, z, annotations, specialities } = React.useMemo(() => getData(towns, items, prices), [towns, items, prices]);
    const [capacity, setCapacity] = React.useState<number>(500);
    const [route, setRoute] = React.useState(() => new business.TradeRoute());
    const syncRoute = useSyncHashableObject(route, route => route.waypoints.length);
    return (
        <>
            <Typography lineHeight={'16px'} marginBottom={'4px'}>
                <Trans>Total Goods Value/Shortage/Surplus</Trans>
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
                onClickAnnotation={({ index }) => {
                    const [town, { market }] = nonNull(specialities[index]);
                    route.add(town, market, capacity);
                    syncRoute(route);
                }}
            />
            {portal.current &&
                createPortal(
                    <RouteControl
                        towns={towns}
                        items={items}
                        route={route}
                        setRoute={setRoute}
                        capacity={capacity}
                        setCapacity={setCapacity}
                    />,
                    portal.current
                )}
        </>
    );
};
