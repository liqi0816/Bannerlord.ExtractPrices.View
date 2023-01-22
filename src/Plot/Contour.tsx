import React from 'react';
import { RootDrilling } from '../Root';
import { ItemId } from '../types';

export const Contour: React.FC<Pick<RootDrilling, 'towns' | 'items' | 'prices' | 'screen'> & { id: ItemId }> = ({
    towns,
    prices,
    screen,
}) => {
    return <>showing {screen}</>;
};
