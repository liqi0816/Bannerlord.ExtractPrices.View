import { Stack, Typography } from '@mui/material';
import React from 'react';
import { RootDrilling } from '../Root';
import { Contour } from './Contour';
import { PlotErrorBoundary } from './ErrorBoundary';
import { Planner } from './Planner';

const PlotContent: React.FC<{
    drilling: Pick<RootDrilling, 'towns' | 'items' | 'prices' | 'screen'>;
    width: number;
    height: number;
}> = ({ drilling, width, height }) => {
    switch (drilling.screen?.type) {
        case 'contour':
            return <Contour id={drilling.screen.id} width={width} height={height} {...drilling} />;
        case 'planner':
            return <Planner portal={drilling.screen.portal} width={width} height={height} {...drilling} />;
        default:
            return <Typography>Please select a plot</Typography>;
    }
};

export const Plot: React.FC<
    { drilling: React.ComponentProps<typeof PlotContent>['drilling'] } & React.ComponentProps<typeof Stack>
> = ({ drilling, ...props }) => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = React.useState<number>();
    const [height, setHeight] = React.useState<number>();
    React.useEffect(() => {
        const { current } = ref;
        if (!current) return;
        const observer = new ResizeObserver(() => {
            const { width, height } = current.getBoundingClientRect();
            setWidth(width);
            setHeight(height);
        });
        observer.observe(current);
        return () => observer.disconnect();
    }, []);
    return (
        <Stack
            flexGrow={1}
            direction={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            minHeight={'50vh'}
            ref={ref}
            {...props}
        >
            <PlotErrorBoundary>
                {width && height && <PlotContent drilling={drilling} width={width} height={height} />}
            </PlotErrorBoundary>
        </Stack>
    );
};
