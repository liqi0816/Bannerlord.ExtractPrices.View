import { Box, Input, Typography } from '@mui/material';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { assert, Item, ItemId, nonNull, Price, Town, TownId } from '../types';

interface Props {
    setTowns: React.Dispatch<React.SetStateAction<Record<TownId, Town>>>;
    setItems: React.Dispatch<React.SetStateAction<Record<ItemId, Item>>>;
    setPrices: React.Dispatch<React.SetStateAction<Price[]>>;
}

/**
 * Use the brower to guess encoding. REQUIRES user guesture.
 */
async function readText(file: File) {
    const url = URL.createObjectURL(new Blob([file]));
    const popup = window.open(url, undefined, 'popup=true,width=1,height=1');
    assert(popup);
    await new Promise(resolve => popup.addEventListener('DOMContentLoaded', resolve));
    URL.revokeObjectURL(url);
    popup.close();
    return nonNull(popup.document.body.textContent);
}

async function readCsv(file: File | undefined) {
    if (!file) return [];
    const [header, ...content] = (await readText(file)).split(/\r?\n/);
    assert(header);
    const columns = header.split(',');
    return content.filter(Boolean).map(row => {
        const ret: Record<string, string | undefined> = {};
        const split = row.split(',');
        for (const [i, name] of columns.entries()) {
            ret[name] = split[i];
        }
        return ret;
    });
}

export const FilesControl: React.FC<Props> = ({ setTowns, setItems, setPrices }) => {
    const townsCallback = useAsyncCallback<void, [React.ChangeEvent<HTMLInputElement>]>(async ({ target }) => {
        const file = target.files?.[0];
        const towns: Record<TownId, Town> = {};
        for (const row of await readCsv(file)) {
            const id = nonNull(row['Town']);
            towns[id] = {
                id,
                name: nonNull(row['Name']),
                x: Number(nonNull(row['x'])),
                y: Number(nonNull(row['y'])),
            };
        }
        setTowns(towns);
    });
    const pricesCallback = useAsyncCallback<void, [React.ChangeEvent<HTMLInputElement>]>(async ({ target }) => {
        const file = target.files?.[0];
        const items: Record<ItemId, Item> = {};
        const prices: Price[] = [];
        for (const row of await readCsv(file)) {
            const id = nonNull(row['Item']);
            if (items[id] && items[id]?.msrp !== Number(nonNull(row['MSRP']))) {
                continue;
            }
            items[id] = {
                id,
                name: nonNull(row['Name']),
                msrp: Number(nonNull(row['MSRP'])),
            };
            prices.push({
                town: nonNull(row['Town']),
                item: nonNull(row['Item']),
                bid: Number(nonNull(row['Bid'])),
                ask: Number(nonNull(row['Ask'])),
                quantity: Number(nonNull(row['Quantity'])),
                supply: Number(nonNull(row['Supply'])),
                demand: Number(nonNull(row['Demand'])),
                delivered: Number(nonNull(row['Delivered'])),
            });
        }
        setItems(items);
        setPrices(prices);
    });
    return (
        <Box
            display={'grid'}
            gridTemplateColumns={{ md: '1fr', lg: '150px 1fr' }}
            gap={0.5}
            justifyItems={'stretch'}
            alignItems={'baseline'}
        >
            <Typography>town.csv</Typography>
            <Input type={'file'} color={townsCallback.error ? 'error' : undefined} onChange={townsCallback.execute} />
            <Typography>price-XXXX-XX.csv</Typography>
            <Input type={'file'} color={pricesCallback.error ? 'error' : undefined} onChange={pricesCallback.execute} />
        </Box>
    );
};
