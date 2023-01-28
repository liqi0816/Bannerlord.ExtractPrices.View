import { Link, Stack, styled, Typography } from '@mui/material';
import React from 'react';
import { RootDrilling } from '../Root';
import { ContourControl } from './ContourControl';
import { FilesControl } from './FilesControl';
import { PlannerControl } from './PlannerControl';

const Code = styled('code')({ fontFamily: 'consolas', color: 'darkblue', wordBreak: 'break-all' });

export const Controls: React.FC<
    {
        drilling: Pick<RootDrilling, 'setTowns' | 'setItems' | 'setPrices' | 'setScreen' | 'items' | 'towns'>;
    } & React.ComponentProps<typeof Stack>
> = ({ drilling, ...props }) => {
    return (
        <Stack alignItems={'stretch'} gap={1} {...props}>
            <Typography variant={'h5'}>1. Extract data</Typography>
            <Typography variant={'caption'}>
                With <Link href={'https://github.com/liqi0816/Bannerlord.ExtractPrices/releases'}>Bannerlord.ExtractPrices</Link>
                {' they will be generated at '}
                <Code>\Mount & Blade II Bannerlord\Modules\Bannerlord.ExtractPrices</Code>
                <br />
                {`Loaded: ${Object.keys(drilling.towns).length} towns and ${Object.keys(drilling.items).length} items.`}
            </Typography>
            <FilesControl {...drilling} />
            <Typography variant={'h5'}>2. Explore the flow</Typography>
            <Typography variant={'caption'}>View the prices of an item across the continent.</Typography>
            <ContourControl {...drilling} />
            <Typography variant={'h5'}>3. Plan a route</Typography>
            <Typography variant={'caption'}>Find the maximal profit possible given a town sequence.</Typography>
            <PlannerControl {...drilling} />
        </Stack>
    );
};
