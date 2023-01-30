import { Trans } from '@lingui/macro';
import { Button, Stack } from '@mui/material';
import React from 'react';
import { RootDrilling } from '../Root';

export const PlannerControl: React.FC<Pick<RootDrilling, 'setScreen'>> = ({ setScreen }) => {
    const ref = React.useRef<HTMLDivElement>();
    return (
        <Stack direction={'column'}>
            <Button variant={'contained'} onClick={() => setScreen({ type: 'planner', portal: ref })}>
                <Trans>Plan Route</Trans>
            </Button>
            <Stack direction={'column'} ref={ref} />
        </Stack>
    );
};
