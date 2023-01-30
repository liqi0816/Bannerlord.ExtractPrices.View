export type TownId = string & { __typename?: 'TownId' };

export interface Town {
    id: TownId;
    name: string;
    x: number;
    y: number;
}

export type ItemId = string & { __typename?: 'ItemId' };

export interface Item {
    id: ItemId;
    name: string;
    /** baseline price as hard coded in game files */
    msrp: number;
}

export interface Price {
    town: TownId;
    item: ItemId;
    /** price when player sells to town */
    bid: number;
    /** price when town sells to player */
    ask: number;
    /** total quantity available in town */
    quantity: number;
    /** a parameter in the pricing model, partly depends on `delivered` at previous day */
    supply: number;
    /** a parameter in the pricing model, partly depends on town prosperity */
    demand: number;
    /** a parameter in the pricing model, equals `quantity` * `msrp` summed up for the item category */
    delivered: number;
}

export function assert(condition: unknown): asserts condition {
    if (!condition) {
        throw new Error(`assert failed: ${condition}`, { cause: { condition } });
    }
}

export function nonNull<T>(value: T): NonNullable<T> {
    if (value === undefined || value === null) {
        throw new TypeError(`unexpected ${value}`);
    }
    return value;
}
