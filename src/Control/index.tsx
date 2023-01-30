import { Trans } from '@lingui/macro';
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
            <Typography variant={'h5'}>
                <Trans>1. Extract data</Trans>
            </Typography>
            <Typography variant={'caption'}>
                <Trans>
                    {'With '}
                    <Link href={'https://github.com/liqi0816/Bannerlord.ExtractPrices/releases'}>Bannerlord.ExtractPrices</Link>
                    {' they will be generated at '}
                    <Code>\Mount & Blade II Bannerlord\Modules\Bannerlord.ExtractPrices</Code>
                    <br />
                    {'Loaded: '}
                    {Object.keys(drilling.towns).length}
                    {' towns and '}
                    {Object.keys(drilling.items).length}
                    {' items.'}
                </Trans>
            </Typography>
            <FilesControl {...drilling} />
            <Typography variant={'h5'}>
                <Trans>2. Explore the flow</Trans>
            </Typography>
            <Typography variant={'caption'}>
                <Trans>View the prices of an item across the continent.</Trans>
            </Typography>
            <ContourControl {...drilling} />
            <Typography variant={'h5'}>
                <Trans>3. Plan a route</Trans>
            </Typography>
            <Typography variant={'caption'}>
                <Trans>Find the maximal profit possible given a town sequence.</Trans>
            </Typography>
            <PlannerControl {...drilling} />
        </Stack>
    );
};
