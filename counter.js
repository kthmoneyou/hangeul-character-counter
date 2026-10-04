const segmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('ko', { granularity: 'grapheme' }) : null;
const whitespace = /^\s+$/u;

export function countText(raw) {
  const text = raw.replace(/\r\n?/g, '\n');
  let withSpaces = 0;
  let withoutSpaces = 0;
  // The simple-text path also keeps very long Korean documents responsive.
  if (!/[\uD800-\uDFFF\p{M}\u1100-\u11FF\u200D]/u.test(text)) {
    withSpaces = text.length;
    withoutSpaces = text.replace(/\s/gu, '').length;
  } else {
    const segments = segmenter ? segmenter.segment(text) : Array.from(text.normalize('NFC'));
    for (const entry of segments) {
      const character = typeof entry === 'string' ? entry : entry.segment;
      withSpaces++;
      if (!whitespace.test(character)) withoutSpaces++;
    }
  }
  return { withSpaces, withoutSpaces, words: (text.match(/\S+/gu) || []).length,
    lines: text.length ? text.split('\n').length : 0,
    bytes: new TextEncoder().encode(raw).length };
}
