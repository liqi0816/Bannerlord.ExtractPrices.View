import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';

export const Plot = React.lazy(async () => ({
    default: createPlotlyComponent(
        // @ts-ignore ts(7016) typing for plotly.js
        await import(/* webpackPrefetch: true */ 'plotly.js/dist/plotly-cartesian')
    ),
}));
export default Plot;
