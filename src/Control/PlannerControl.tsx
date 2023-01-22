import { Button, Stack, TextField } from '@mui/material';
import React from 'react';
import { RootDrilling } from '../Root';

export const PlannerControl: React.FC<Pick<RootDrilling, 'towns'>> = ({ towns }) => {
    return (
        <Stack direction={'column'} gap={0.5}>
            <TextField label={'Capacity'} variant={'outlined'} type={'number'} />
            <Button variant={'contained'}>Plan Route</Button>
        </Stack>
    );
};
