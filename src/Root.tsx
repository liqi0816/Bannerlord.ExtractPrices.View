import { AppBar, CssBaseline, Link, Stack, Toolbar, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { Controls } from './Control';
import { Plot } from './Plot';
import { Item, ItemId, Price, Town, TownId } from './types';

const theme = createTheme();

type Screen =
    | {
          type: 'contour';
          id: ItemId;
      }
    | { type: 'planner' }
    | undefined;

export interface RootDrilling {
    towns: Record<TownId, Town>;
    setTowns: React.Dispatch<React.SetStateAction<RootDrilling['towns']>>;
    items: Record<ItemId, Item>;
    setItems: React.Dispatch<React.SetStateAction<RootDrilling['items']>>;
    prices: Price[];
    setPrices: React.Dispatch<React.SetStateAction<RootDrilling['prices']>>;
    screen: Screen;
    setScreen: React.Dispatch<React.SetStateAction<RootDrilling['screen']>>;
}

export const Root: React.FC = () => {
    const [towns, setTowns] = React.useState<RootDrilling['towns']>({});
    const [items, setItems] = React.useState<RootDrilling['items']>({});
    const [prices, setPrices] = React.useState<RootDrilling['prices']>([]);
    const [screen, setScreen] = React.useState<RootDrilling['screen']>();
    const drilling = { towns, setTowns, items, setItems, prices, setPrices, screen, setScreen } as const;
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Stack direction={'column'} flexWrap={'nowrap'} minHeight={'100vh'}>
                <AppBar position={'relative'}>
                    <Toolbar sx={{ gap: 1 }}>
                        <Typography variant={'h6'} color={'inherit'} noWrap flexGrow={1}>
                            Bannerlord Extract Prices Viewer
                        </Typography>
                        <Link color={'inherit'} href={'https://github.com/liqi0816/Bannerlord.ExtractPrices'}>
                            Mod
                        </Link>
                        <Link color={'inherit'} href={'https://github.com/liqi0816/bannerlord.extractprices.view'}>
                            Viewer
                        </Link>
                    </Toolbar>
                </AppBar>
                <Stack
                    component={'main'}
                    direction={{ xs: 'column', md: 'row' }}
                    flexWrap={'nowrap'}
                    flexGrow={1}
                    justifyContent={'start'}
                    paddingX={{ xs: 1, md: 10 }}
                    paddingY={{ md: 2 }}
                    gap={2}
                >
                    <Controls drilling={drilling} flexBasis={'min(30%, 400px)'} />
                    <Plot drilling={drilling} />
                </Stack>
            </Stack>
        </ThemeProvider>
    );
};
