import { Stack, Typography } from '@mui/material';
import React from 'react';
import { RootDrilling } from '../Root';
import { Contour } from './Contour';

const PlotPlaceholder: React.FC = () => (
    <Stack flexGrow={1} direction={'row'} alignItems={'center'} justifyContent={'center'} gap={1}>
        <Typography>Please select a plot</Typography>
    </Stack>
);

export const Plot: React.FC<
    {
        drilling: Pick<RootDrilling, 'towns' | 'items' | 'prices' | 'screen'>;
    } & React.ComponentProps<typeof Stack>
> = ({ drilling, ...props }) => {
    switch (drilling.screen?.type) {
        case 'contour':
            return <Contour id={drilling.screen.id} {...drilling} />;
        default:
            return <PlotPlaceholder />;
    }
};
