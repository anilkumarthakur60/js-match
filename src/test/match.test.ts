import { match } from "../match.ts";

describe('match function', () => {
    it('should return the correct action for the matched case', () => {
        const result = match('test')
            .on('test', () => 'matched')
            .on('not matched', () => 'not matched')
            .otherwise(() => 'otherwise');
        expect(result).toBe('matched');
    });

    it('should return the otherwise action if no cases are matched', () => {
        const result = match('test')
            .on('not matched', () => 'not matched')
            .otherwise(() => 'otherwise');
        expect(result).toBe('otherwise');
    });


    it('should correctly handle multiple cases with one match', () => {
        const result = match('second')
            .on('first', () => 'first case')
            .on('second', () => 'second case')
            .on('third', () => 'third case')
            .otherwise(() => 'otherwise');
        expect(result).toBe('second case');
    });

    it('should execute the default action when provided', () => {
        const result = match('none')
            .on('first', () => 'first case')
            .on('second', () => 'second case')
            .otherwise(() => 'default action');
        expect(result).toBe('default action');
    });

    it('should correctly handle no cases with only otherwise', () => {
        const result = match('none')
            .otherwise(() => 'default action');
        expect(result).toBe('default action');
    });
});
