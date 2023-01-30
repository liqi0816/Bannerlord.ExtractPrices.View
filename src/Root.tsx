import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { AppBar, CssBaseline, Link, Stack, Toolbar, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { Controls } from './Control';
import { Plot } from './Plot';
import { Item, ItemId, Price, Town, TownId } from './types';

const theme = createTheme();

type Screen =
    | {
          type: 'contour';
          id: ItemId;
      }
    | {
          type: 'planner';
          capacity: number;
      }
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
    const { execute: setLanguage, status: languageStatus } = useAsyncCallback(async (language: string) => {
        const actualLanguage = ['zh', 'en'].find(v => language.startsWith(v)) ?? 'en';
        const { messages } = await import(`../locales/${actualLanguage}/messages.js`);
        i18n.load(actualLanguage, messages);
        const plurals = [
            new Intl.PluralRules(actualLanguage),
            new Intl.PluralRules(actualLanguage, { type: 'ordinal' }),
        ] as const;
        i18n.loadLocaleData(actualLanguage, {
            plurals: (n, ordinal) => plurals[ordinal ? 1 : 0].select(n),
        });
        i18n.activate(actualLanguage);
    });
    React.useEffect(() => void setLanguage(navigator.language), [setLanguage]);
    if (languageStatus !== 'success') {
        return <Typography>Loading language...</Typography>;
    }
    return (
        <I18nProvider i18n={i18n}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Stack direction={'column'} flexWrap={'nowrap'} height={{ md: '100vh' }} overflow={{ md: 'hidden' }}>
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
                        overflow={{ md: 'hidden' }}
                        flexWrap={'nowrap'}
                        flexGrow={1}
                        justifyContent={'start'}
                        padding={2}
                        gap={1}
                    >
                        <Controls drilling={drilling} flexBasis={'min(30%, 400px)'} overflow={'auto'} paddingRight={0.5} />
                        <Plot drilling={drilling} />
                    </Stack>
                </Stack>
            </ThemeProvider>
        </I18nProvider>
    );
};
