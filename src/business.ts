import { ItemId, nonNull, Price, TownId } from './types';

/**
 * The mid-price is a determined by
 *
 * `$$ {(\frac{demand \cdot msrp}{0.1 supply + 0.04 delivered + 2})}^{0.6} $$`
 *
 * The exponent is adjusted to `0.3` for `Animal`.
 *
 * We use the partial derivative with respect to `delivered` as an indicator of [price elasticity](https://en.wikipedia.org/wiki/Price_elasticity_of_supply)
 */
export function getPriceElasticity({
    supply,
    demand,
    delivered,
    isAnimal = false,
}: {
    supply: number;
    demand: number;
    delivered: number;
    isAnimal?: boolean;
}) {
    if (isAnimal) {
        return (0.012 * Math.pow(demand / (0.1 * supply + 0.04 * delivered + 2), 1.3)) / demand;
    }
    return (0.024 * Math.pow(demand / (0.1 * supply + 0.04 * delivered + 2), 1.6)) / demand;
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

export function findItemAtMarket(market: Price[], item: ItemId) {
    return market.find(price => price.item === item);
}

export function getUnitProfitAtMarket(market: Price[], price: Price) {
    return nonNull(findItemAtMarket(market, price.item)).bid - price.ask;
}

/**
 * Find the surplus, shortage, total market value of each town
 * @param topN the `topN` towns with lowest/highest price will be labeled as having a surplus/shortage in an item
 */
export function calcTownSpecialities(prices: Price[], topN: number = 4) {
    const ret: Record<TownId, TownSpecialities> = {};
    for (const price of prices) {
        const specialities = (ret[price.town] ??= new TownSpecialities());
        specialities.market.push(price);
    }
    for (const specialities of Object.values(ret)) {
        for (const { ask, quantity } of specialities.market) {
            specialities.totalValue += ask * quantity;
        }
    }
    const groupByItem: Record<ItemId, Price[]> = {};
    for (const price of prices) {
        const item = (groupByItem[price.item] ??= []);
        item.push(price);
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
            // nonexistent item - skip
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

export function calcProfitAtMarket(market: Price[], inventoryBeforeTrade: Price[]) {
    return inventoryBeforeTrade
        .map(({ item, quantity }) => (findItemAtMarket(market, item)?.bid ?? 0) * quantity)
        .reduce((a, b) => a + b, 0);
}

export function calcNeededCapacity(prices: Pick<Price, 'quantity'>[]) {
    return prices.map(({ quantity }) => quantity).reduce((a, b) => a + b, 0);
}

interface TradeRouteWaypoint {
    town: TownId;
    marketBeforeTrade: Price[];
    inventoryBeforeTrade: Price[];
}

const debugProfitSymbol = Symbol('debug.profit') as unknown as keyof Price;

export class TradeRoute {
    waypoints: TradeRouteWaypoint[] = [];

    add(town: TownId, market: Price[], capacity: number) {
        const lastWaypoint = this.waypoints.at(-1);
        const nextWaypoint: TradeRouteWaypoint = { town, marketBeforeTrade: market, inventoryBeforeTrade: [] };
        if (lastWaypoint) {
            const tradeSelections = [...lastWaypoint.marketBeforeTrade, ...lastWaypoint.inventoryBeforeTrade]
                .map(price => ({
                    price,
                    profit: getUnitProfitAtMarket(nextWaypoint.marketBeforeTrade, price),
                }))
                .filter(({ profit, price: { quantity } }) => quantity > 0 && profit > 0)
                .sort((a, b) => a.profit - b.profit);
            let remainingCapacity = capacity;
            while (remainingCapacity) {
                const pop = tradeSelections.pop();
                if (!pop) break;
                const { price, profit } = pop;
                const quantity = Math.min(price.quantity, remainingCapacity);
                // if not selling - equivalent to buy back at same price
                const ask = findItemAtMarket(nextWaypoint.marketBeforeTrade, price.item)?.bid ?? 0;
                nextWaypoint.inventoryBeforeTrade.push({ ...price, quantity, ask, [debugProfitSymbol]: profit });
                remainingCapacity -= quantity;
            }
        }
        this.waypoints.push(nextWaypoint);
    }

    pop() {
        this.waypoints.pop();
    }
}
