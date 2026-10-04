import test from 'node:test';
import assert from 'node:assert/strict';
import { countText } from '../counter.js';

test('empty editor', () => assert.deepEqual(countText(''), { withSpaces: 0, withoutSpaces: 0, words: 0, lines: 0, bytes: 0 }));
test('Korean with spaces and line breaks', () => assert.deepEqual(countText('안녕 하세요\n반갑습니다'), { withSpaces: 12, withoutSpaces: 10, words: 3, lines: 2, bytes: 32 }));
test('tabs and nonbreaking spaces are whitespace', () => assert.deepEqual(countText('가\t나\u00a0다'), { withSpaces: 5, withoutSpaces: 3, words: 3, lines: 1, bytes: 12 }));
test('visible emoji and decomposed Hangul are each one character', () => {
  assert.equal(countText('👨‍👩‍👧‍👦👍🏽🇰🇷').withSpaces, 3);
  assert.equal(countText('\u1100\u1161').withSpaces, 1);
  assert.equal(countText('e\u0301').withSpaces, 1);
});
test('line endings count as one break; bytes retain original source', () => assert.deepEqual(countText('가\r\n나'), { withSpaces: 3, withoutSpaces: 2, words: 2, lines: 2, bytes: 8 }));
test('whitespace-only input', () => assert.deepEqual(countText(' \t\n'), { withSpaces: 3, withoutSpaces: 0, words: 0, lines: 2, bytes: 3 }));
test('large Korean document', () => { const result = countText('안녕하세요 '.repeat(100000)); assert.equal(result.withSpaces, 600000); assert.equal(result.withoutSpaces, 500000); });
