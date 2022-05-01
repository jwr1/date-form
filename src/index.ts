type CodeGen = (date: Date) => string | number | FormatTokens;
type FlagFunc = (str: string, pad?: number) => string;
export type Code = {
  gen: CodeGen;
  flag?: string;
  pad?: number;
};
export type Flag = string | FlagFunc;
export type Codes = Record<string, Code>;
export type Flags = Record<string, Flag>;
export type FormatTokens = (string | [string, number?, ...string[]])[];

export class DateForm {
  static codes: Codes = {};
  static flags: Flags = {
    '-': (str) => str,
    _: ' ',
    '0': '0',
    '^': (str) => str.toUpperCase(),
    '#': (str) => str.toLowerCase(),
  };
  static codeMatch: RegExp = /^%([^%a-z]*)([%a-z]+)/i;
  static flagMatch: RegExp = /^([^%a-z])/i;
  static padMatch: RegExp = /^([1-9]\d*)/;

  static parseFormat(input: string): FormatTokens {
    let out: FormatTokens = [];
    let letters: string = '';

    for (let i = 0; i < input.length; i++) {
      const str = input.substring(i);
      const match = str.match(this.codeMatch);
      if (match) {
        const [wholeMatch, flagsMatch, codeMatch] = match;
        if (letters.length > 0) {
          out.push(letters);
          letters = '';
        }
        let pad: number | undefined;
        const flags: string[] = [];
        for (let j = 0; j < flagsMatch.length; j++) {
          const flagStr = flagsMatch.substring(j);

          const padMatchA = flagStr.match(this.padMatch);
          if (padMatchA) {
            const [wholePadMatch, padMatchG] = padMatchA;
            const padMatchGNum = Number(padMatchG);
            if (!isNaN(padMatchGNum)) pad = padMatchGNum;
            j += wholePadMatch.length - 1;
          } else {
            const flagMatchA = flagStr.match(this.flagMatch);
            if (flagMatchA) {
              const [wholeFlagMatch, flagMatchG] = flagMatchA;
              flags.push(flagMatchG);
              j += wholeFlagMatch.length - 1;
            }
          }
        }
        if (pad === undefined && flags.length === 0) {
          out.push([codeMatch]);
        } else {
          out.push([codeMatch, pad, ...flags]);
        }
        i += wholeMatch.length - 1;
      } else {
        letters += input[i];
      }
    }

    if (letters) out.push(letters);

    return out;
  }

  static applyFormat(input: FormatTokens, date = new Date()): string {
    return input.reduce<string>((out, token) => {
      if (Array.isArray(token)) {
        const [codeMatch, codePad, ...flagsMatch] = token;
        if (this.codes.hasOwnProperty(codeMatch)) {
          let { gen: codeFunc, flag: defaultFlag, pad: defaultPad } = this.codes[codeMatch];

          const pad = codePad ?? defaultPad;

          const codeFuncOut = codeFunc(date);

          let tokenOut = Array.isArray(codeFuncOut)
            ? this.applyFormat(codeFuncOut, date)
            : String(codeFuncOut);

          if (flagsMatch.length > 0) {
            for (const flag of flagsMatch) {
              if (this.flags.hasOwnProperty(flag)) {
                if (typeof this.flags[flag] === 'function') {
                  tokenOut = (this.flags[flag] as FlagFunc)(tokenOut, pad);
                } else if (pad !== undefined) {
                  tokenOut = tokenOut.padStart(pad, this.flags[flag] as string);
                }
              }
            }
          } else if (defaultFlag) {
            if (typeof this.flags[defaultFlag] === 'function') {
              tokenOut = (this.flags[defaultFlag] as FlagFunc)(tokenOut, pad);
            } else if (pad !== undefined) {
              tokenOut = tokenOut.padStart(pad, this.flags[defaultFlag] as string);
            }
          }

          return out + tokenOut;
        }
        return out;
      } else return out + token;
    }, '');
  }

  static format(format: string, date?: Date) {
    return this.applyFormat(this.parseFormat(format), date);
  }
}

export const names = {
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  abbrDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  abbrMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  meridiem: { am: 'am', AM: 'AM', pm: 'pm', PM: 'PM' },
};

const weekNumCalc = (d: Date, monday = false) => {
  let weekday = d.getDay();

  // Shift if week starts on monday.
  if (monday) {
    if (weekday === 0) weekday = 6;
    else weekday--;
  }

  return Math.floor(
    (Math.floor(
      (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 1)) /
        86400000
    ) +
      7 -
      weekday) /
      7
  );
};

export const utils = {
  century: ((d) => Math.floor(d.getFullYear() / 100)) as CodeGen,
  dayName: ((d) => names.days[d.getDay()]) as CodeGen,
  dayNameAbbr: ((d) => names.abbrDays[d.getDay()]) as CodeGen,
  dayOfMonth: ((d) => d.getDate()) as CodeGen,
  dayOfWeek: ((d) => d.getDay()) as CodeGen,
  dayOfWeekMon: ((d) => {
    const day = d.getDay();
    return day === 0 ? 7 : day;
  }) as CodeGen,
  dayOfYear: ((d) =>
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) /
    86400000) as CodeGen, // 24 * 60 * 60 * 1000
  hour12: ((d) => ((d.getHours() + 11) % 12) + 1) as CodeGen,
  hour24: ((d) => d.getHours()) as CodeGen,
  meridiemLower: ((d) => (d.getHours() >= 12 ? names.meridiem.pm : names.meridiem.am)) as CodeGen,
  meridiemUpper: ((d) => (d.getHours() >= 12 ? names.meridiem.PM : names.meridiem.AM)) as CodeGen,
  millisecond: ((d) => d.getMilliseconds()) as CodeGen,
  minute: ((d) => d.getMinutes()) as CodeGen,
  monthName: ((d) => names.months[d.getMonth()]) as CodeGen,
  monthNameAbbr: ((d) => names.abbrMonths[d.getMonth()]) as CodeGen,
  monthNum: ((d) => d.getMonth() + 1) as CodeGen,
  quarterOfYear: ((d) => Math.floor(d.getMonth() / 3) + 1) as CodeGen,
  second: ((d) => d.getSeconds()) as CodeGen,
  secondsSinceEpoch: ((d) => Math.floor(d.getTime() / 1000)) as CodeGen,
  timeZoneNum: ((d) => {
    const off = d.getTimezoneOffset();
    return (
      (off > 0 ? '-' : '+') +
      Math.floor(Math.abs(off / 60))
        .toString()
        .padStart(2, '0') +
      Math.abs(off % 60)
        .toString()
        .padStart(2, '0')
    );
  }) as CodeGen,
  timeZoneAbbr: ((d) =>
    d.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2]) as CodeGen,
  weekOfYear: ((d) => weekNumCalc(d)) as CodeGen,
  weekOfYearMon: ((d) => weekNumCalc(d, true)) as CodeGen,
  year: ((d) => d.getFullYear()) as CodeGen,
  yearOfCentury: ((d) => d.getFullYear() % 100) as CodeGen,
};

export class StrfDate extends DateForm {
  static codes: Codes = {
    '%': { gen: () => '%' },
    a: { gen: utils.dayNameAbbr, flag: '_' },
    A: { gen: utils.dayName, flag: '_' },
    b: { gen: utils.monthNameAbbr, flag: '_' },
    B: { gen: utils.monthName, flag: '_' },
    c: { gen: () => [['a'], ' ', ['b'], ' ', ['d'], ' ', ['X'], ' ', ['Y'], ' ', ['Z']] },
    C: { gen: utils.century, flag: '0', pad: 2 },
    d: { gen: utils.dayOfMonth, flag: '0', pad: 2 },
    D: { gen: () => [['m'], '/', ['d'], '/', ['y']] },
    e: { gen: utils.dayOfMonth, flag: '_', pad: 2 },
    F: { gen: () => [['Y'], '-', ['m'], '-', ['d']] },
    h: { gen: utils.monthNameAbbr, flag: '_' },
    H: { gen: utils.hour24, flag: '0', pad: 2 },
    I: { gen: utils.hour12, flag: '0', pad: 2 },
    j: { gen: utils.dayOfYear, flag: '0', pad: 3 },
    k: { gen: utils.hour24, flag: '_', pad: 2 },
    l: { gen: utils.hour12, flag: '_', pad: 2 },
    L: { gen: utils.millisecond, flag: '0', pad: 3 },
    m: { gen: utils.monthNum, flag: '0', pad: 2 },
    M: { gen: utils.minute, flag: '0', pad: 2 },
    n: { gen: () => '\n' },
    p: { gen: utils.meridiemUpper, flag: '_' },
    P: { gen: utils.meridiemLower, flag: '_' },
    q: { gen: utils.quarterOfYear, flag: '0' },
    r: { gen: () => [['I'], ':', ['M'], ':', ['S'], ' ', ['p']] },
    R: { gen: () => [['H'], ':', ['M']] },
    s: { gen: utils.secondsSinceEpoch, flag: '0' },
    S: { gen: utils.second, flag: '0', pad: 2 },
    t: { gen: () => '\t' },
    T: { gen: () => [['H'], ':', ['M'], ':', ['s']] },
    u: { gen: utils.dayOfWeekMon, flag: '0' },
    U: { gen: utils.weekOfYear, flag: '0' },
    w: { gen: utils.dayOfWeek, flag: '0' },
    W: { gen: utils.weekOfYearMon, flag: '0' },
    x: { gen: () => [['D']] },
    X: { gen: () => [['r']] },
    y: { gen: utils.yearOfCentury, flag: '0', pad: 2 },
    Y: { gen: utils.year, flag: '0', pad: 4 },
    z: { gen: utils.timeZoneNum, flag: '_' },
    Z: { gen: utils.timeZoneAbbr, flag: '_' },
  };
  static flags: Flags = {
    ...DateForm.flags,
    ':': (str) =>
      str.endsWith(':00:00')
        ? str.slice(0, -6)
        : str[str.length - 3] === ':'
        ? str + ':00'
        : str.slice(0, -2) + ':' + str.slice(-2),
  };
  static codeMatch: RegExp = /^%([^%a-z]*)([%a-z])/i;
}

export class ExpressDate extends DateForm {
  static codes: Codes = {
    '%': { gen: () => '%' },
    a: { gen: utils.meridiemLower, flag: '_' },
    A: { gen: utils.meridiemUpper, flag: '_' },
    C: { gen: utils.century, flag: '0', pad: 2 },
    d: { gen: utils.dayOfWeek, flag: '0' },
    ddd: { gen: utils.dayNameAbbr, flag: '_' },
    dddd: { gen: utils.dayName, flag: '_' },
    D: { gen: utils.dayOfMonth, flag: '0' },
    DD: { gen: utils.dayOfMonth, flag: '0', pad: 2 },
    h: { gen: utils.hour12, flag: '0' },
    hh: { gen: utils.hour12, flag: '0', pad: 2 },
    H: { gen: utils.hour24, flag: '0' },
    HH: { gen: utils.hour24, flag: '0', pad: 2 },
    m: { gen: utils.minute, flag: '0' },
    mm: { gen: utils.minute, flag: '0', pad: 2 },
    M: { gen: utils.monthNum, flag: '0' },
    MM: { gen: utils.monthNum, flag: '0', pad: 2 },
    MMM: { gen: utils.monthNameAbbr, flag: '_' },
    MMMM: { gen: utils.monthName, flag: '_' },
    s: { gen: utils.second, flag: '0' },
    ss: { gen: utils.second, flag: '0', pad: 2 },
    S: { gen: (d) => Math.floor(d.getMilliseconds() / 100), flag: '0' },
    SS: { gen: (d) => Math.floor(d.getMilliseconds() / 10), flag: '0', pad: 2 },
    SSS: { gen: utils.millisecond, flag: '0', pad: 3 },
    YY: { gen: utils.yearOfCentury, flag: '0', pad: 2 },
    YYYY: { gen: utils.year, flag: '0', pad: 4 },
    Z: { gen: utils.timeZoneAbbr, flag: '_' },
    ZZ: { gen: utils.timeZoneNum, flag: '_' },
    ZZZ: {
      gen: (d) => {
        const off = utils.timeZoneNum(d) as string;
        return off.slice(0, -2) + ':' + off.slice(-2);
      },
      flag: '_',
    },
  };
}
