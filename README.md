# date-form

Customizable date formatter with builtin presets.

#### npm

```bash
npm install date-form
```

#### yarn

```bash
yarn add date-form
```

## Usage

Each preset listed below contains their own set of codes used for formatting. Each code will be replaced with its corresponding value. For example, the `H` code will be replaced with the hour.

### With `StrfDate`

This preset is based off the `strftime` function from the `c` language and is interchangeable with it. It's also the same format used for python and ruby as well as GNU's date util.

```js
import { StrfDate } from 'date-form';

console.log(StrfDate.format('%m/%d/%Y, %H:%M')); // 01/15/2022, 13:15
console.log(StrfDate.format('%-I:%M:%S %p', new Date('2020-01-01T15:42:19'))); // 3:42:19 PM
```

See the [`StrfDate` Reference](#strfdate-reference) section for available formats.

### With `ExpressDate`

This preset is a more expressive alternative to `StrfDate` and is easier to use without a reference.

```js
import { ExpressDate } from 'date-form';

console.log(ExpressDate.format('%MM/%DD/%YYYY, %HH:%mm')); // 01/15/2022, 13:15
console.log(ExpressDate.format('%h:%mm:%ss %A', new Date('2020-01-01T15:42:19'))); // 3:42:19 PM
```

See the [`ExpressDate` Reference](#expressdate-reference) section for available formats.

### Flags

A flag lets you modify the output of a code used in your format. Here are the default flags used for both `StrfDate` and `ExpressDate`:

| Flag             | Description               | Example                                         |
| ---------------- | ------------------------- | ----------------------------------------------- |
| `-` (hyphen)     | Prevent the default flag. | `StrfDate.format('%-m')` (Removes zero padding) |
| `_` (underscore) | Pad with spaces.          | `StrfDate.format('%_m')` (Default for words)    |
| `0` (zero)       | Pad with zeros.           | `StrfDate.format('%0m')` (Default for numbers)  |
| `^`              | Use upper case letters.   | `StrfDate.format('%^B')`                        |
| `#`              | Use lower case letters.   | `StrfDate.format('%#B')`                        |

### Padding

You can override the amount of padding used for a code by putting a number where the flags go, in between the `%` symbol and the code's letter. For example, you can use `%4H` to pad the output of the code with up to four zeros. If you did `%_4h` then the output would be padding with up to four spaces. Flags and pads do not need to be in a specific order. The only restriction is that the `0` flag should not be used right after the pad.

### Caching

If you are constantly using the same format with different dates you can cache the format for the next run.

Use `parseFormat` to save the format.

```js
const format = ExpressDate.parseFormat('%h:%mm:%ss %A');
```

Use `applyFormat` to use the format with a date.

```js
setInterval(() => {
  console.log(ExpressDate.applyFormat(format, new Date()));
}, 1000);
```

## Custom Preset

To create your own preset, extend the `DateForm` from this package. A preset involves defining the following components:

### Codes

The codes are defined within your class as a static property.

```typescript
import { DateForm, Codes } from 'date-form';

class MyDate extends DateForm {
  static codes: Codes = {
    h: { gen: (date) => date.getHours(), flag: '0' },
    m: { gen: (date) => date.getMinutes(), flag: '0', pad: 2 },
  };
}
```

This example defines a simple preset that lets you put the hours and the minutes in your format with the `h` and `m` codes respectively. The `gen` method within each code's object passes in the date as a parameter and the return value is used as the output. The `flag` property specifies the default flag used for the code. This is generally `0` for numbers and `_` for words. The `pad` property specifies the default amount of padding for the code. In the example, the `h` code has a default flag of `0` but will not be padded automatically. The `m` code specifies both fields and will be padded automatically with zeros up to two digits.

### Flags

The flags are also defined as a static property in your preset's class.

```typescript
import { DateForm, Flags } from 'date-form';

class MyDate extends DateForm {
  static flags: Flags = {
    ...DateForm.flags,
    '*': '*',
    '!': (str, pad) => str.padEnd(pad ?? 0, '!'),
  };
}
```

This example extends the default flags with two extra flags. A `*` flag which pads a code with \*'s and a `!` flag which right pads the code with !'s. When a flag is just a string, it will automatically pad the start of the code. When a flag is a function, the code's output and padding are passed in as parameters. The return of the flag's function replaces the code's output.

### Matches

Their are several regular expressions in a preset that can be modified.

```typescript
import { DateForm } from 'date-form';

class MyDate extends DateForm {
  static codeMatch: RegExp = /^%([^%a-z]*)([%a-z]+)/i;
  static flagMatch: RegExp = /^([^%a-z])/i;
  static padMatch: RegExp = /^([1-9]\d*)/;
}
```

The `codeMatch` expression is used to find a code within a date format. The first match group is for flags and padding and is passed into the other regular expressions. The second match group is the code's ID. The `flagMatch` expression is used to search for flags within the first group from the first expression. The `padMatch` expression is used to search for pad specifiers within that same group.

The example shown above is used as the default values, you only need to specify these properties if you want to change them.

## `StrfDate` Reference

| Code    | Description                                                         |
| ------- | ------------------------------------------------------------------- |
| `%%`    | a literal %                                                         |
| `%a`    | abbreviated weekday name (e.g., Sun)                                |
| `%A`    | full weekday name (e.g., Sunday)                                    |
| `%b`    | abbreviated month name (e.g., Jan)                                  |
| `%B`    | full month name (e.g., January)                                     |
| `%c`    | date and time (e.g., Thu Mar 3 23:05:25 2005)                       |
| `%C`    | century; like %Y, except omit last two digits (e.g., 20)            |
| `%d`    | day of month (e.g., 01)                                             |
| `%D`    | date; same as %m/%d/%y                                              |
| `%e`    | day of month, space padded; same as %\_d                            |
| `%F`    | full date; same as %Y-%m-%d                                         |
| `%h`    | same as %b                                                          |
| `%H`    | hour (00..23)                                                       |
| `%I`    | hour (01..12)                                                       |
| `%j`    | day of year (001..366)                                              |
| `%k`    | hour, space padded ( 0..23); same as %\_H                           |
| `%l`    | hour, space padded ( 1..12); same as %\_I                           |
| `%L`    | milliseconds (000..999)                                             |
| `%m`    | month (01..12)                                                      |
| `%M`    | minute (00..59)                                                     |
| `%n`    | a newline                                                           |
| `%p`    | either AM or PM                                                     |
| `%P`    | like %p, but lower case                                             |
| `%q`    | quarter of year (1..4)                                              |
| `%r`    | 12-hour clock time (e.g., 11:11:04 PM)                              |
| `%R`    | 24-hour hour and minute; same as %H:%M                              |
| `%s`    | seconds since 1970-01-01 00:00:00 UTC                               |
| `%S`    | second (00..60)                                                     |
| `%t`    | a tab                                                               |
| `%T`    | time; same as %H:%M:%S                                              |
| `%u`    | day of week (1..7); 1 is Monday                                     |
| `%U`    | week number of year, with Sunday as first day of week (00..53)      |
| `%w`    | day of week (0..6); 0 is Sunday                                     |
| `%W`    | week number of year, with Monday as first day of week (00..53)      |
| `%x`    | date representation (e.g., 12/31/99)                                |
| `%X`    | time representation (e.g., 23:13:48)                                |
| `%y`    | last two digits of year (00..99)                                    |
| `%Y`    | year                                                                |
| `%z`    | +hhmm numeric time zone (e.g., -0400)                               |
| `%:z`   | +hh:mm numeric time zone (e.g., -04:00)                             |
| `%::z`  | +hh:mm:ss numeric time zone (e.g., -04:00:00)                       |
| `%:::z` | numeric time zone with : to necessary precision (e.g., -04, +05:30) |
| `%Z`    | alphabetic time zone abbreviation (e.g., EDT)                       |

## `ExpressDate` Reference

| Code    | Description                                                 |
| ------- | ----------------------------------------------------------- |
| `%%`    | a literal %                                                 |
| `%a`    | either am or pm                                             |
| `%A`    | like %a, but upper case                                     |
| `%C`    | century; like %YYYY, except omit last two digits (e.g., 20) |
| `%d`    | day of week (0..6)                                          |
| `%ddd`  | abbreviated weekday name (e.g., Sun)                        |
| `%dddd` | full weekday name (e.g., Sunday)                            |
| `%D`    | day of month (e.g., 1)                                      |
| `%DD`   | day of month, zero padded; same as %0D                      |
| `%h`    | hour (1..12)                                                |
| `%hh`   | hour, zero padded (01..12); same as %0h                     |
| `%H`    | hour (0..23)                                                |
| `%HH`   | hour, zero padded (00..23); same as %0H                     |
| `%m`    | minute (0..59)                                              |
| `%mm`   | minute, zero padded; same as %0m                            |
| `%M`    | month (1..12)                                               |
| `%MM`   | month, zero padded; same as %0M                             |
| `%MMM`  | abbreviated month name (e.g., Jan)                          |
| `%MMMM` | full month name (e.g., January)                             |
| `%s`    | second (0..60)                                              |
| `%ss`   | second, zero padded; same as %0s                            |
| `%S`    | greatest digit of milliseconds (0..9)                       |
| `%SS`   | greatest two digits of milliseconds (00..99)                |
| `%SSS`  | milliseconds (000..999)                                     |
| `%YY`   | last two digits of year (00..99)                            |
| `%YYYY` | year                                                        |
| `%Z`    | alphabetic time zone abbreviation (e.g., EDT)               |
| `%ZZ`   | +hhmm numeric time zone (e.g., -0400)                       |
| `%ZZZ`  | +hh:mm numeric time zone (e.g., -04:00)                     |
