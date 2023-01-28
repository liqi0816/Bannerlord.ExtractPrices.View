import { Button, Stack, TextField } from '@mui/material';
import React from 'react';
import { RootDrilling } from '../Root';

export const PlannerControl: React.FC<Pick<RootDrilling, 'setScreen'>> = ({ setScreen }) => {
    return (
        <Stack direction={'column'} gap={0.5} display={'none'}>
            <TextField label={'Capacity'} variant={'outlined'} type={'number'} />
            <Button variant={'contained'} onClick={() => setScreen({ type: 'planner' })}>
                Plan Route
            </Button>
        </Stack>
    );
};
