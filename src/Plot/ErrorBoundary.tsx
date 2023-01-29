import { Typography } from '@mui/material';
import React from 'react';

export class PlotErrorBoundary extends React.Component<React.PropsWithChildren> {
    state: { error?: Error } = {};
    /** @deprecated I'm too lazy */
    lastError?: Error;

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    render() {
        const { error } = this.state;
        if (error && this.lastError !== error) {
            this.lastError = error;
            return (
                <>
                    <Typography variant={'h4'} color={'error'}>
                        Error:
                    </Typography>
                    <Typography variant={'caption'} color={'error'} sx={{ whiteSpace: 'pre-wrap' }}>
                        {error.stack}
                    </Typography>
                    <Typography variant={'caption'} color={'error'}>
                        cause={String(error.cause)}
                    </Typography>
                </>
            );
        }
        return this.props.children;
    }
}
