# @anilkumarthakur/match

`@anilkumarthakur/match` is a JavaScript library inspired by PHP's match expression. It allows for more readable and
maintainable code by providing a clean and concise way to handle small to large conditional logic.

## Installation
Install the package using npm:
```shell
npm install @anilkumarthakur/match
```
## Basic Usage
```ts
import {match} from '@anilkumarthakur/match';

const handleCheck = (types: string) => {
    return match(types)
        .on('success', () => {
            console.log('----------------success output--', 'success');
            return 'success';
        })
        .on('error', () => {
            console.log('----------------error output--', 'error');
            return 'error';
        })
        .on('warning', () => {
            console.log('----------------warning output--', 'warning');
            return 'warning';
        })
        .on('info', () => {
            console.log('----------------info output--', 'info');
            return 'info';
        })
        .on('defaultNotify', () => {
            console.log('----------------defaultNotify output--', 'defaultNotify');
            return 'defaultNotify';
        })
        .on('dark', () => {
            console.log('----------------dark output--', 'dark');
            return 'dark';
        })
        .on('light', () => {
            console.log('----------------light output--', 'light');
            return 'light';
        })
        .on('spinner', () => {
            console.log('----------------spinner output--', 'spinner');
            return 'spinner';
        })
        .otherwise(() => {
            console.log('----------------otherwise output:', 'otherwise');
            return 'otherwise';
        });
}

// Example of using match with various data types
const complexCheck = (input: unknown) => {
    return match(input)
        .on('hello', () => 'Matched hello')
        .on(42, () => 'Matched number 42')
        .on(true, () => 'Matched true')
        .on(null, () => 'Matched null')
        .on(undefined, () => 'Matched undefined')
        .otherwise(() => 'No match found');
}

console.log(handleCheck('success'));
console.log(complexCheck('hello'));
console.log(complexCheck(42));
console.log(complexCheck(true));
console.log(complexCheck(null));
console.log(complexCheck('unmatched'));
```
## Contributing
Feel free to submit issues and pull requests. Contributions are welcome!