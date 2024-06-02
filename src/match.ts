import {Match} from "./types/main";

const match = <T, U>(value: T) => {
    const cases: Match<T, U>[] = [];
    let defaultAction: (() => U) | null = null;

    const matcher = {
        on: (expected: T, action: () => U) => {
            const predicate = (val: T) => val === expected;
            cases.push({predicate, action});
            return matcher;
        },
        otherwise: (action: () => U): U => {

            defaultAction = action;
            return execute();
        },
    };

    const execute = (): U => {
        for (const {predicate, action} of cases) {
            if (predicate(value)) {
                return action();
            }
        }
        if (defaultAction) {
            return defaultAction();
        }
        throw new Error('No match found and no default action provided.');
    };

    return matcher;
};

export {
    match
}