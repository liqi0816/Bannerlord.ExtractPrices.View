/**
 * The mid-price is a determined by
 *
 * `$$ {(\frac{demand \cdot msrp}{0.1 supply + 0.04 fulfilled + 2})}^{0.6} $$`
 *
 * The exponent is adjusted to `0.3` for `Animal`.
 *
 * We use the partial derivative with respect to `fulfilled` as an indicator of [price elasticity](https://en.wikipedia.org/wiki/Price_elasticity_of_supply)
 */
export function getPriceElasticityOfFulfilled({
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
