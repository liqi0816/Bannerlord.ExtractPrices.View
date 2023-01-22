const statusSymbol = Symbol('useAwait.status');
const resultSymbol = Symbol('useAwait.result');

interface Future<T> extends PromiseLike<T> {
    [statusSymbol]?: 'pending' | 'fulfilled' | 'rejected';
    [resultSymbol]?: T | unknown;
}

type MaybeFuture<T> = Future<T> | T;

/**
 * Awaitable function to Suspense
 *
 * @experimental
 * @see https://17.reactjs.org/docs/concurrent-mode-suspense.html
 * @see https://dev.to/darkmavis1980/a-practical-example-of-suspense-in-react-18-3lln
 */
export function useAwait<T>(value: MaybeFuture<T>): T {
    if (typeof value === 'object' && value && 'then' in value) {
        if (value[statusSymbol] === 'fulfilled') {
            return value[resultSymbol] as T;
        } else if (value[statusSymbol] === 'rejected') {
            throw value[resultSymbol];
        } else {
            if (value[statusSymbol] === undefined) {
                value[statusSymbol] = 'pending';
                value.then(
                    result => {
                        value[statusSymbol] = 'fulfilled';
                        value[resultSymbol] = result;
                    },
                    result => {
                        value[statusSymbol] = 'rejected';
                        value[resultSymbol] = result;
                    }
                );
            }
            throw value;
        }
    } else {
        return value;
    }
}
