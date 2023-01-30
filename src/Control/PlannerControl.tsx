import { t, Trans } from '@lingui/macro';
import { Button, Stack, TextField } from '@mui/material';
import React from 'react';
import { RootDrilling } from '../Root';

export const PlannerControl: React.FC<Pick<RootDrilling, 'setScreen'>> = ({ setScreen }) => {
    const [capacity, setCapacity] = React.useState(500);
    return (
        <Stack direction={'column'} gap={0.5}>
            <TextField
                label={t`Capacity`}
                variant={'outlined'}
                type={'number'}
                value={capacity}
                inputProps={{ step: 100 }}
                onChange={({ target }) => setCapacity(Number(target.value))}
            />
            <Button variant={'contained'} onClick={() => setScreen({ type: 'planner', capacity })}>
                <Trans>Plan Route</Trans>
            </Button>
        </Stack>
    );
};
