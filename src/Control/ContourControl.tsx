import { Box, Button } from '@mui/material';
import React from 'react';
import { RootDrilling } from '../Root';

export const ContourControl: React.FC<Pick<RootDrilling, 'items'>> = ({ items }) => {
    const itemsSorted = React.useMemo(() => Object.values(items).sort((a, b) => a.msrp - b.msrp), [items]);
    return (
        <Box display={'grid'} gridTemplateColumns={'repeat(auto-fit, minmax(150px, 1fr))'} gap={0.5}>
            {itemsSorted.map(({ name, id }) => (
                <Button key={id} variant={'outlined'}>
                    {name}
                </Button>
            ))}
        </Box>
    );
};
