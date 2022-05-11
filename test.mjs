import test from 'ava';
import {StrfDate, ExpressDate} from './dist/index.mjs';

const d = new Date(977768145000);

test('StrfDate', (t) => {
  t.is(StrfDate.format('%Y-%m-%d %-I:%M:%S', d), '2000-12-25 1:15:45');
  t.is(StrfDate.format('%8Y', d), '00002000');
  t.is(StrfDate.format('%-I', d), '1');
  t.is(StrfDate.format('%5_M', d), '   15');
  t.is(StrfDate.format('%04p', d), '00PM');
  t.is(StrfDate.format('%^b', d), 'DEC');
  t.is(StrfDate.format('%#a', d), 'mon');
});

test('ExpressDate', (t) => {
  t.is(ExpressDate.format('%YYYY-%MM-%DD %h:%mm:%ss', d), '2000-12-25 1:15:45');
  t.is(ExpressDate.format('%8YYYY', d), '00002000');
  t.is(ExpressDate.format('%-hh', d), '1');
  t.is(ExpressDate.format('%5_m', d), '   15');
  t.is(ExpressDate.format('%04A', d), '00PM');
  t.is(ExpressDate.format('%^MMM', d), 'DEC');
  t.is(ExpressDate.format('%#ddd', d), 'mon');
});
