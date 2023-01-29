import { ItemId, nonNull, Price, TownId } from '../types';

/**
 * The mid-price is a determined by
 *
 * `$$ {(\frac{demand \cdot msrp}{0.1 supply + 0.04 fulfilled + 2})}^{0.6} $$`
 *
 * The exponent is adjusted to `0.3` for `Animal`.
 *
 * We use the partial derivative with respect to `fulfilled` as an indicator of [price elasticity](https://en.wikipedia.org/wiki/Price_elasticity_of_supply)
 */
export function getPriceElasticity({
    supply,
    demand,
    fulfilled,
    isAnimal = false,
}: {
    supply: number;
    demand: number;
    fulfilled: number;
    isAnimal?: boolean;
}) {
    if (isAnimal) {
        return (0.012 * Math.pow(demand / (0.1 * supply + 0.04 * fulfilled + 2), 1.3)) / demand;
    }
    return (0.024 * Math.pow(demand / (0.1 * supply + 0.04 * fulfilled + 2), 1.6)) / demand;
}

export class TownSpecialities {
    market: Price[] = [];
    totalValue: number = 0;
    shortage: Price[] = [];
    surplus: Price[] = [];

    get totalValueInK() {
        return Math.round(this.totalValue / 1000);
    }
}

export function calcTownSpecialities(prices: Price[], topN: number = 4) {
    const ret: Record<TownId, TownSpecialities> = {};
    for (const price of prices) {
        (ret[price.town] ??= new TownSpecialities()).market.push(price);
    }
    for (const specialities of Object.values(ret)) {
        for (const { ask, quantity } of specialities.market) {
            specialities.totalValue += ask * quantity;
        }
    }
    const groupByItem: Record<ItemId, Price[]> = {};
    for (const price of prices) {
        (groupByItem[price.item] ??= []).push(price);
    }
    for (const group of Object.values(groupByItem)) {
        group.sort((a, b) => a.ask - b.ask);
        const topNAsk = group.at(topN - 1)!.ask;
        const topNBid = group.at(-topN)!.bid;
        if (topNBid / topNAsk <= 2) {
            // low margin item - skip
            continue;
        }
        if (!group.at(0)?.quantity) {
            // non exist item - skip
            continue;
        }
        for (const price of group) {
            if (price.ask <= topNAsk) {
                nonNull(ret[price.town]).surplus.push(price);
            } else if (price.bid >= topNBid) {
                nonNull(ret[price.town]).shortage.push(price);
            }
        }
    }
    return ret;
}

/**
 * create dummy points at edge of the map
 */
export function getBoundaryPoints(x: Float64Array, y: Float64Array, z: Uint32Array) {
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMin = Math.min(...y);
    const yMax = Math.max(...y);
    let zSum = 0;
    for (const v of z) {
        zSum += v;
    }
    return [
        { x: xMin - 0.1 * (xMax - xMin), y: yMin - 0.1 * (yMax - yMin), z: zSum / z.length },
        { x: xMin - 0.1 * (xMax - xMin), y: yMax + 0.1 * (yMax - yMin), z: zSum / z.length },
        { x: xMax + 0.1 * (xMax - xMin), y: yMin - 0.1 * (yMax - yMin), z: zSum / z.length },
        { x: xMax + 0.1 * (xMax - xMin), y: yMax + 0.1 * (yMax - yMin), z: zSum / z.length },
    ] as const;
}
